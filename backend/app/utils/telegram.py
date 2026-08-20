import hashlib
import hmac
import json
from urllib.parse import urlparse, parse_qsl


def validate_telegram_init_data(init_data: str, bot_token: str) -> dict | None:
    try:
        print(f"[TG] initData first200={init_data[:200]}", flush=True)
        print(f"[TG] initData length={len(init_data)}", flush=True)

        parsed = urlparse(f"https://t.me/?{init_data}")
        params = dict(parse_qsl(parsed.query))

        print(f"[TG] params keys={list(params.keys())}", flush=True)

        received_hash = params.pop("hash", None)
        if not received_hash:
            print("[TG] ERROR: No hash found", flush=True)
            return None

        data_check_pairs = []
        for key in sorted(params.keys()):
            val = params[key]
            if isinstance(val, list):
                for item in val:
                    data_check_pairs.append(f"{key}={item}")
            else:
                data_check_pairs.append(f"{key}={val}")

        data_check_string = "\n".join(data_check_pairs)
        print(f"[TG] data_check_string first300={data_check_string[:300]}", flush=True)

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

        print(f"[TG] computed={computed_hash}", flush=True)
        print(f"[TG] received={received_hash}", flush=True)
        print(f"[TG] match={computed_hash == received_hash}", flush=True)

        if computed_hash != received_hash:
            return None

        result = {}
        for key, value in params.items():
            if key == "user":
                result["user"] = parse_user_data(value)
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

        return result

    except Exception as e:
        print(f"[TG] EXCEPTION: {type(e).__name__}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return None


def parse_user_data(user_json: str) -> dict | None:
    try:
        return json.loads(user_json)
    except Exception:
        return None


def check_auth_date(auth_date: int, max_age_seconds: int = 86400) -> bool:
    import time
    current_time = int(time.time())
    return (current_time - auth_date) <= max_age_seconds
