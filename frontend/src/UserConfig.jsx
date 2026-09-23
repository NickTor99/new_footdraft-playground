import ImageUploader from './components/generic/ImageUploader';
import { useState } from 'react';
import {api} from "./APIWrapper.js";

export default function UserConfig() {
    const [referenceId, setReferenceId] = useState(null);

    const handleImageReady = async (base64String) => {
        // 1. L'utente ha ritagliato l'immagine, ora la mandiamo al backend
        console.log("Immagine pronta (primi 50 char):", base64String.substring(0, 50));

        const response = await api.put('http://localhost:8000/users/me/image', {user_image_base64: base64String})

    };

    return (
        <div className="p-10 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Modifica Profilo</h1>

            <ImageUploader onImageReady={handleImageReady} />

            {referenceId && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                    Reference pronta! ID: {referenceId}
                </div>
            )}
        </div>
    );
}