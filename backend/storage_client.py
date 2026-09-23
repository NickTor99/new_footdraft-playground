from minio import Minio
import io

class StorageClient:
    def __init__(self, bucket_name: str, access_key: str, secret_key: str, hostname: str):
        self.client = Minio(
            hostname,
            access_key=access_key,          # Mettile nel .env in produzione!
            secret_key=secret_key,
            secure=False                 # False perché in locale usiamo HTTP, non HTTPS
        )
        self.bucket_name = bucket_name
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Crea il bucket se non esiste e lo rende pubblico (in sola lettura)"""
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)

            # Impostiamo una policy pubblica per permettere al Frontend di scaricare le immagini
            # Senza questo, le immagini sarebbero private e inaccessibili via URL diretto
            policy = f'''{{
                "Version": "2012-10-17",
                "Statement": [
                    {{
                        "Effect": "Allow",
                        "Principal": {{ "AWS": ["*"] }},
                        "Action": ["s3:GetObject"],
                        "Resource": ["arn:aws:s3:::{self.bucket_name}/*"]
                    }}
                ]
            }}'''
            self.client.set_bucket_policy(self.bucket_name, policy)
            print(f"Bucket '{self.bucket_name}' creato e reso pubblico.")

    def upload_image(self, image_data: io.BytesIO, filename: str, content_type="image/png") -> str:
        """Carica un file e ritorna l'URL pubblico"""

        # Reset del puntatore del buffer (importante!)
        image_data.seek(0)
        file_size = image_data.getbuffer().nbytes

        self.client.put_object(
            bucket_name=self.bucket_name,
            object_name=filename,
            data=image_data,
            length=file_size,
            content_type=content_type
        )

        # Costruiamo l'URL che il Frontend userà.
        # ATTENZIONE: Il frontend gira sul browser dell'utente, quindi non può risolvere "minio".
        # Deve usare "localhost" (se sei in dev locale) o il dominio del server.
        return f"http://localhost:9000/{self.bucket_name}/{filename}"

