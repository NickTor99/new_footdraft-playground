import React, { useState } from 'react';
import {
    CloudOff,
    RefreshCw,
    Home,
    AlertCircle,
    Mail,
    HelpCircle,
    Globe
} from 'lucide-react';

/**
 * COMPONENTE: ServerOfflinePage
 * Una pagina di errore generica e professionale da mostrare quando
 * i servizi non sono raggiungibili.
 */
export default function ServerOfflinePage() {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = () => {
        setIsRetrying(true);
        setTimeout(() => {
            setIsRetrying(false);
            window.location.href = '/'
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-100">
            {/* Elementi decorativi di sfondo (Soft Gradients) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-lg w-full text-center">
                {/* Illustrazione / Icona Centrale */}
                <div className="relative inline-flex items-center justify-center mb-10">
                    <div className="w-32 h-32 bg-white rounded-full shadow-2xl shadow-blue-200/50 flex items-center justify-center border border-slate-100">
                        <CloudOff className={`w-14 h-14 ${isRetrying ? 'text-slate-300' : 'text-blue-600'} transition-colors duration-500`} />
                    </div>
                    <div className="absolute -top-2 -right-2">
            <span className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500 items-center justify-center border-4 border-slate-50">
                <AlertCircle className="w-4 h-4 text-white" />
              </span>
            </span>
                    </div>
                </div>

                {/* Messaggio principale */}
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-slate-900">
                    Connessione Interrotta
                </h1>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                    Spiacenti, non riusciamo a raggiungere i nostri server in questo momento.
                    Controlla la tua connessione internet o riprova tra qualche istante.
                </p>

                {/* Azioni di Ripristino */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 transform active:scale-95 shadow-lg ${
                            isRetrying
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                        }`}
                    >
                        <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                        {isRetrying ? 'Verifica in corso...' : 'Ricarica pagina'}
                    </button>

                    <button className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95">
                        <Home className="w-5 h-5 text-slate-400" />
                        Home Page
                    </button>
                </div>

                {/* Link di supporto secondari */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-200">
                    <a href="#" className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50 transition-colors">
                            <Globe className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stato Servizi</span>
                    </a>

                    <a href="#" className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50 transition-colors">
                            <Mail className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contattaci</span>
                    </a>

                    <a href="#" className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50 transition-colors">
                            <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aiuto</span>
                    </a>
                </div>
            </div>

            {/* Footer Tecnico */}
            <footer className="absolute bottom-8 left-0 w-full text-center">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em]">
                    Status: Offline | Reference: #{Math.floor(1000 + Math.random() * 9000)}
                </p>
            </footer>
        </div>
    );
}