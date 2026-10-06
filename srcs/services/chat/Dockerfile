FROM python:3.12-slim

WORKDIR /app

COPY chat/requirements.txt .

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        build-essential \
        pkg-config \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY chat/ .

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]