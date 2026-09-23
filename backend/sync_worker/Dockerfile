FROM python:3.11

WORKDIR /app

COPY sync_worker/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY sync_worker/ .

COPY elastic_manager.py .

EXPOSE 8004

CMD ["python", "sync_elastic_postgres.py"]