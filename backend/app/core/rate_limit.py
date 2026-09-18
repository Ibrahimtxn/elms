"""
Rate limiting for sensitive endpoints (login/register), to slow down
brute-force and credential-stuffing attempts.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)