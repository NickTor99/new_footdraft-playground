import React, {useState} from "react";
import {Zap, Loader2, Sparkles} from "lucide-react";
import ImageUploader from "../generic/ImageUploader.jsx";
import {api} from "../../APIWrapper.js";

export default function CreateAvatar({ playerId, groupId, onSaveAvatar }) {
    const [initialBase64String, setInitialBase64String] = useState(null);
    // 1. Nuovo stato per gestire il caricamento
    const [isGenerating, setIsGenerating] = useState(false);

    async function onSubmit(base64String) {
        // 2. Attiva il loader
        setIsGenerating(true);
        console.log("Inizio generazione...");

        try {
            // Nota: ho aggiunto await al .json() se api.post usa fetch nativo,
            // se usi axios 'response.data' è gestito diversamente. Adatto per axios qui sotto.
            const response = await api.post(`http://localhost:8003/generate`, {
                init_image_base64: base64String,
                shirt_colors: 'blue'
            });

            console.log(response);

            // Assumo che la risposta di axios sia in response.data
            // Se usi fetch nativo, adatta questo pezzo
            const imageData = response.data ? response.data.image_base64 : response.image_base64;

            setInitialBase64String(imageData);

        } catch (error) {
            console.error("Errore generazione:", error);
            alert("Errore durante la generazione dell'avatar.");
        } finally {
            // 3. Spegni il loader SEMPRE, anche se c'è errore
            setIsGenerating(false);
        }
    }



    return (
        <div className="max-w-md mx-auto relative">

            {/* WRAPPER DEL CONTENUTO PRINCIPALE */}
            <div className="relative rounded-xl overflow-hidden">

                {/* 4. OVERLAY DI CARICAMENTO MODERNO */}
                {isGenerating && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300">
                        <div className="relative">
                            {/* Cerchio che gira */}
                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-white p-4 rounded-full shadow-xl">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            </div>
                        </div>

                        <div className="mt-6 text-center space-y-1">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                                L'IA sta disegnando...
                            </h3>
                            <p className="text-sm text-gray-500">Miglioramento dettagli e stile in corso</p>
                        </div>
                    </div>
                )}

                {/* Il Componente Uploader */}
                <ImageUploader
                    onImageReady={onSubmit}
                    initialBase64String={initialBase64String}
                    mode='creating'
                />
            </div>

            {/* BOTTONE SALVA (Disabilitato durante la generazione) */}
            <button
                onClick={() => onSaveAvatar(initialBase64String)}
                disabled={isGenerating} // Disabilita click
                className={`w-full mt-4 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300
                    ${isGenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5'
                }
                `}
            >
                {isGenerating ? (
                    <span>Attendere prego...</span>
                ) : (
                    <>
                        Salva Avatar <Zap size={20} className={initialBase64String ? "fill-yellow-300 text-yellow-300" : ""} />
                    </>
                )}
            </button>
        </div>
    );
}