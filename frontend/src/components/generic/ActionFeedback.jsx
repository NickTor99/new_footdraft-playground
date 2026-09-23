import React, { useEffect } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X
} from 'lucide-react';

/**
 * ActionFeedback - Un componente per mostrare l'esito di un'azione.
 * * @param {string} message - Il testo da visualizzare.
 * @param message
 * @param {string} type - Tipo di feedback: 'success', 'error', 'warning', 'info'.
 * @param {function} onClose - Funzione chiamata alla chiusura (manuale o automatica).
 * @param {number} duration - Durata in ms prima della chiusura automatica (default 5000).
 */
export default function ActionFeedback ({
                            message,
                            type = 'info',
                            onClose,
                            duration = 5000
                        }) {

    // Timer per l'auto-chiusura
    useEffect(() => {
        if (duration > 0 && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!message) return null;

    // Mappatura stili e icone in base al tipo
    const configs = {
        success: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-800',
            iconColor: 'text-emerald-500',
            icon: CheckCircle2,
            shadow: 'shadow-emerald-100'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-800',
            iconColor: 'text-red-500',
            icon: AlertCircle,
            shadow: 'shadow-red-100'
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'text-amber-800',
            iconColor: 'text-amber-500',
            icon: AlertTriangle,
            shadow: 'shadow-amber-100'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-800',
            iconColor: 'text-blue-500',
            icon: Info,
            shadow: 'shadow-blue-100'
        }
    };

    const config = configs[type] || configs.info;
    const Icon = config.icon;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`${config.bg} ${config.border} border ${config.shadow} shadow-lg rounded-2xl p-4 flex items-start gap-3`}>
                {/* Icona */}
                <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
                    <Icon size={20} />
                </div>

                {/* Messaggio */}
                <div className="flex-1">
                    <p className={`text-sm font-bold ${config.text}`}>
                        {message}
                    </p>
                </div>

                {/* Tasto Chiusura */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-white/50"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};