FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY s_draft/app .

# Voglio copiare tutti i file .py fuori alla cartella che solo utilities necessarie
COPY *.py .

EXPOSE 8002

# Crea utente non-root (Best Practice)
RUN useradd -m appuser
USER appuser

CMD ["uvicorn", "main_draft:app", "--host", "0.0.0.0", "--port", "8002"]




