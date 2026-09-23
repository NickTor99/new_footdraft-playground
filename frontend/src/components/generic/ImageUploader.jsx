import React, {useState, useCallback, useEffect} from 'react';
import Cropper from 'react-easy-crop';
import {Wand} from "lucide-react";


// --- UTILITY FUNCTIONS (Mettile qui o in un file utils.js) ---

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

/**
 * Questa funzione disegna il ritaglio su un canvas e ritorna il Base64
 */
async function getCroppedImg(imageSrc, pixelCrop, outputSize = 512) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Impostiamo il canvas alla dimensione desiderata (es. 512x512)
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Disegniamo l'immagine ritagliata e ridimensionata nel canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    );

    // Convertiamo in Base64 (JPEG per risparmiare spazio, o PNG per qualità)
    // 0.9 è la qualità
    return canvas.toDataURL('image/jpeg', 0.9);
}

const prepareBase64Image = (base64String) => {
    if (!base64String) return null;

    // Se ha già il prefisso, la usiamo così com'è
    if (base64String.startsWith('data:image')) {
        return base64String;
    }

    // Altrimenti aggiungiamo il prefisso standard (PNG è il più sicuro se non sai il tipo)
    return `data:image/png;base64,${base64String}`;
};

// --- COMPONENTE PRINCIPALE ---

const ImageUploader = ({ onImageReady, initialBase64String, mode}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // 1. Gestione Caricamento File
    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
        }
    };

    useEffect(() => {
        if (initialBase64String) {
            const formattedImage = prepareBase64Image(initialBase64String);
            setImageSrc(formattedImage);
        }
    }, [initialBase64String]);


    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result));
            reader.readAsDataURL(file);
        });
    };

    // 2. Callback quando l'utente smette di muovere l'immagine
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // 3. Generazione Finale
    const handleGenerate = async () => {
        try {
            // Ottieni il Base64 ritagliato e ridimensionato a 512px
            const base64Image = await getCroppedImg(imageSrc, croppedAreaPixels, 512);

            // Rimuovi l'header "data:image/jpeg;base64," se il backend lo richiede puro
            const cleanBase64 = base64Image.split(',')[1];

            // Passa il risultato al componente padre
            onImageReady(cleanBase64);

        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">

            {/* Se non c'è immagine, mostra input */}
            {!imageSrc ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clicca per caricare</span></p>
                    </div>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </label>
            ) : (
                // Se c'è immagine, mostra editor
                <div className="w-full flex flex-col gap-4">
                    <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={3 / 4} // Aspect Ratio delle card (es. 3:4 o 1:1)
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-2 ">
                        <button
                            onClick={() => setImageSrc(null)}
                            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cambia Foto
                        </button>
                        <button
                            onClick={handleGenerate}
                            className="w-full  py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                        >

                            {mode === 'creating'?
                                <>
                                    Genera Foto
                                    <Wand />
                                </>

                                :
                                'Conferma'
                            }
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;