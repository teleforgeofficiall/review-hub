from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

request_counts: dict[str, list[float]] = {}
RATE_LIMIT = 60  # requests per minute
RATE_WINDOW = 60  # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        if client_ip not in request_counts:
            request_counts[client_ip] = []

        request_counts[client_ip] = [
            t for t in request_counts[client_ip] if now - t < RATE_WINDOW
        ]

        if len(request_counts[client_ip]) >= RATE_LIMIT:
            return Response(
                content='{"detail":"Rate limit exceeded. Try again later."}',
                status_code=429,
                media_type="application/json",
            )

        request_counts[client_ip].append(now)

        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
