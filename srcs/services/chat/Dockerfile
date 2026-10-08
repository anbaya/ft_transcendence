FROM python:3.12-slim-bookworm

WORKDIR /app

COPY chat/requirements.txt .

RUN apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false update \
    && apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        build-essential \
        pkg-config \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY chat/ .
COPY shared/start-django.sh ./start-django.sh
COPY shared/migrate-and-exec.py ./migrate-and-exec.py
RUN chmod +x ./start-django.sh

EXPOSE 8000

CMD ["./start-django.sh", "daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]