import hashlib
import hmac
import json
import time


class AuthError:
    MISSING_HASH = "MISSING_HASH"
    HMAC_MISMATCH = "HMAC_MISMATCH"
    AUTH_EXPIRED = "AUTH_EXPIRED"
    INVALID_USER_DATA = "INVALID_USER_DATA"
    BOT_TOKEN_MISSING = "BOT_TOKEN_MISSING"
    PARSE_ERROR = "PARSE_ERROR"


class AuthResult:
    def __init__(self, success=False, data=None, error_code=None, detail=None):
        self.success = success
        self.data = data
        self.error_code = error_code
        self.detail = detail

    def __bool__(self):
        return self.success


def validate_telegram_init_data(init_data: str, bot_token: str) -> AuthResult:
    try:
        if not bot_token:
            return AuthResult(
                error_code=AuthError.BOT_TOKEN_MISSING,
                detail="Server BOT_TOKEN not configured",
            )

        if not init_data:
            return AuthResult(
                error_code=AuthError.PARSE_ERROR,
                detail="Empty init_data",
            )

        # Split into raw key=value pairs (keep URL-encoding intact for HMAC)
        raw_pairs = {}
        for pair in init_data.split("&"):
            if "=" not in pair:
                continue
            key, value = pair.split("=", 1)
            raw_pairs[key] = value

        received_hash = raw_pairs.pop("hash", None)
        if not received_hash:
            return AuthResult(
                error_code=AuthError.MISSING_HASH,
                detail="No hash in initData",
            )

        # Build data_check_string from RAW (URL-encoded) pairs, sorted by key
        data_check_pairs = []
        for key in sorted(raw_pairs.keys()):
            data_check_pairs.append(f"{key}={raw_pairs[key]}")
        data_check_string = "\n".join(data_check_pairs)

        # Compute HMAC
        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode("utf-8"),
            hashlib.sha256,
        ).digest()

        computed_hash = hmac.new(
            secret_key,
            data_check_string.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if computed_hash != received_hash:
            print(
                f"[AUTH] HMAC mismatch: computed_prefix={computed_hash[:16]}, "
                f"received_prefix={received_hash[:16]}, "
                f"pairs_count={len(data_check_pairs)}, "
                f"token_prefix={bot_token[:15]}",
                flush=True,
            )
            return AuthResult(
                error_code=AuthError.HMAC_MISMATCH,
                detail="Data integrity check failed",
            )

        # Now decode values for business logic (after HMAC check passed)
        from urllib.parse import unquote
        params = {}
        for key, value in raw_pairs.items():
            params[key] = unquote(value)

        # Check auth_date freshness
        auth_date = params.get("auth_date")
        if auth_date:
            try:
                auth_ts = int(auth_date)
                current_ts = int(time.time())
                if (current_ts - auth_ts) > 86400:
                    return AuthResult(
                        error_code=AuthError.AUTH_EXPIRED,
                        detail="Session expired (auth_date older than 24h)",
                    )
            except (ValueError, TypeError):
                pass

        # Parse user data
        result = {}
        for key, value in params.items():
            if key == "user":
                user_data = parse_user_data(value)
                if not user_data:
                    return AuthResult(
                        error_code=AuthError.INVALID_USER_DATA,
                        detail="Could not parse user data",
                    )
                result["user"] = user_data
            elif key == "auth_date":
                result["auth_date"] = int(value)
            elif key == "chat_instance":
                result["chat_instance"] = value
            elif key == "chat_type":
                result["chat_type"] = value
            elif key == "start_param":
                result["start_param"] = value
            elif key == "can_send_after":
                result["can_send_after"] = int(value)

        if "user" not in result:
            return AuthResult(
                error_code=AuthError.INVALID_USER_DATA,
                detail="No user in initData",
            )

        return AuthResult(data=result)

    except Exception as e:
        print(f"[AUTH] EXCEPTION: {type(e).__name__}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return AuthResult(
            error_code=AuthError.PARSE_ERROR,
            detail=f"Unexpected error: {type(e).__name__}",
        )


def parse_user_data(user_json: str) -> dict | None:
    try:
        return json.loads(user_json)
    except Exception:
        return None


def check_auth_date(auth_date: int, max_age_seconds: int = 86400) -> bool:
    current_time = int(time.time())
    return (current_time - auth_date) <= max_age_seconds
