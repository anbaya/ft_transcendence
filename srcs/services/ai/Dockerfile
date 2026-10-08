FROM python:3.12-slim

WORKDIR /app
COPY shared/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY shared/manage.py ./manage.py
COPY shared/service ./service
COPY shared/start.sh ./start.sh
COPY shared/migrate-and-exec.py ./migrate-and-exec.py
RUN chmod +x ./start.sh

ENV PORT=8000
EXPOSE 8000
CMD ["./start.sh"]
