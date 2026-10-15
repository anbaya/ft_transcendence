FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY auth/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY auth/ .
COPY shared/start-django.sh ./start-django.sh
COPY shared/migrate-and-exec.py ./migrate-and-exec.py
RUN sed -i 's/\r$//' ./start-django.sh ./migrate-and-exec.py && chmod +x ./start-django.sh

EXPOSE 8000

CMD ["./start-django.sh", "python", "manage.py", "runserver", "0.0.0.0:8000"]