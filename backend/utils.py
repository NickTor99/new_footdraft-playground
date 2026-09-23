import base64
import io

from PIL import Image


def decode_base64_image(base64_string):
    image = Image.open(io.BytesIO(base64.decodebytes(bytes(base64_string, "utf-8"))))
    # Ridimensioniamo l'immagine in ingresso per evitare errori di memoria se è troppo grande
    image.thumbnail((768, 768))
    return image



