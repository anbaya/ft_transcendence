#!/bin/sh
set -eu

exec python migrate-and-exec.py daphne -b 0.0.0.0 -p "${PORT:-8000}" service.asgi:application
