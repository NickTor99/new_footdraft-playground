FROM nvidia/cuda:12.6.0-cudnn-runtime-ubuntu22.04

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python

# PyTorch EXACT match
RUN pip install --no-cache-dir \
    torch==2.10.0 \
    torchvision==0.25.0 \
    torchaudio==2.10.0 \
    --index-url https://download.pytorch.org/whl/cu126

COPY s_gen_image/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY s_gen_image/app /app
COPY utils.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
