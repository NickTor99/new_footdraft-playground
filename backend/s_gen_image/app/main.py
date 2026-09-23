import asyncio
from utils import decode_base64_image
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
# Importiamo la nuova pipeline e le classi per ControlNet
from diffusers import StableDiffusionControlNetImg2ImgPipeline, ControlNetModel, UniPCMultistepScheduler
import torch
import io
import base64
from PIL import Image
# Importiamo il pre-processore che trasforma la foto in un disegno a linee
from controlnet_aux import LineartAnimeDetector
from rembg import remove

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # URL di React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-Custom-Header"], # 👈 Specifica qui i tuoi header
)

# --- CONFIGURAZIONE ---
# Percorso del tuo nuovo modello anime (Counterfeit V3)
BASE_MODEL_PATH = "../models/counterfeit_v3.safetensors"
# Il nome del ControlNet su HuggingFace (lo scaricherà automaticamente nella cache di Docker)
CONTROLNET_ID = "lllyasviel/control_v11p_sd15s2_lineart_anime"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if DEVICE == "cuda" else torch.float32

print(f"Loading models on {DEVICE}...")

pipe = None
preprocessor = None

try:
    # 1. Carichiamo il Pre-processore (trasforma foto -> lineart)
    print("Loading preprocessor...")
    preprocessor = LineartAnimeDetector.from_pretrained("lllyasviel/Annotators")
    preprocessor.to(DEVICE)

    # 2. Carichiamo il modello ControlNet
    print("Loading ControlNet model...")
    controlnet = ControlNetModel.from_pretrained(
        CONTROLNET_ID,
        torch_dtype=torch_dtype,
        use_safetensors=True  # Se disponibile
    )

    # 3. Creiamo la Pipeline Principale combinando tutto
    print("Loading Base Model and creating pipeline...")
    pipe = StableDiffusionControlNetImg2ImgPipeline.from_single_file(
        BASE_MODEL_PATH,
        controlnet=controlnet,  # Inseriamo il controlnet nella pipeline
        torch_dtype=torch_dtype,
        use_safetensors=True,
        safety_checker=None  # Opzionale: disabilita il checker per risparmiare RAM
    )

    # Usiamo uno scheduler veloce e buono per l'anime
    pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
    pipe.to(DEVICE)

    # Ottimizzazioni per VRAM (essenziali con ControlNet)
    pipe.enable_model_cpu_offload()
    # Se hai pochissima VRAM, usa invece: pipe.enable_sequential_cpu_offload()

    print(">>> ALL MODELS LOADED SUCCESSFULLY! <<<")

except Exception as e:
    print(f"CRITICAL ERROR loading models: {e}")


# --- MODELLI DATI ---
class ChibiRequest(BaseModel):
    init_image_base64: str  # Ora è obbligatoria
    prompt_description: str = "a person with brown hair"  # Descrizione semplice del soggetto
    negative_prompt: str = "bad anatomy, worst quality, low quality, realistic, photorealistic, 3d, ugly, show hands, full body"

    # Parametri calibrati per questo workflow
    steps: int = 30
    strength: float = 0.4  # Img2Img strength (quanto colore prende dalla foto)
    controlnet_conditioning_scale: float = 1.2  # Quanto deve seguire i contorni (1.0 = molto)
    guidance_scale: int = 7.5
    seed: int = -1
    shirt_colors: str

@app.post("/generate")
async def generate_image(req: ChibiRequest):
    if pipe is None or preprocessor is None:
        raise HTTPException(status_code=500, detail="Models not loaded.")

    try:
        print("Decoding input image...")
        input_image = decode_base64_image(req.init_image_base64)

        # --- FASE 1: Pre-processing ---
        print("Generating Control Image (Lineart)...")
        # Il pre-processore prende la foto e ne estrae i contorni stile anime
        control_image = preprocessor(input_image)

        # Controlliamo se le dimensioni sono diverse e forziamo il resize del controllo
        if input_image.size != control_image.size:
            print(f"Mismatch dimensioni! Org: {input_image.size} vs Ctrl: {control_image.size}. Resizing...")
            # Ridimensioniamo il controllo per combaciare perfettamente con l'originale
            control_image = control_image.resize(input_image.size)

        # --- FASE 2: Costruzione Prompt Chibi ---
        # Forziamo lo stile chibi nel prompt
        final_prompt = f"chibi style, football player anime portrait, head and shoulders shot, shirt colors: {req.shirt_colors}, {req.prompt_description}, cute, big head, white background, masterpiece, best quality"
        print(f"Prompt: {final_prompt}")

        # Setup Seed per riproducibilità
        generator = None
        if req.seed != -1:
            generator = torch.Generator(device=DEVICE).manual_seed(req.seed)

        # --- FASE 3: Generazione ---
        print("Running ControlNet Pipeline...")
        generated_image = pipe(
            prompt=final_prompt,
            negative_prompt=req.negative_prompt,

            # L'immagine originale fornisce i colori e una base
            image=input_image,
            strength=req.strength,  # 0.5-0.7 è il range ideale qui

            # L'immagine lineart FORZA la forma
            control_image=control_image,
            controlnet_conditioning_scale=req.controlnet_conditioning_scale,

            num_inference_steps=req.steps,
            guidance_scale=req.guidance_scale,
            generator=generator
        ).images[0]

        # --- FASE 4: POST-PROCESSING ---
        print("Removing background...")

        # Rimuovi lo sfondo (diventa trasparente PNG)
        no_bg_image = remove(generated_image)

        # Encoding finale
        buffered = io.BytesIO()
        no_bg_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {"status": "success", "image_base64": img_str}

    except Exception as e:
        print(f"Error during generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))




with open('../test64') as f:
    base = f.read()
req = ChibiRequest(init_image_base64=base, shirt_colors='red')

import asyncio

result = asyncio.run(generate_image(req=req))

image = decode_base64_image(result['image_base64'])

image.save('../test_image/results.png', format='PNG')

