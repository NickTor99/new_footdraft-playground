import {AlertTriangle} from "lucide-react";

function ConfirmDialog({ title, message, onConfirm, onCancel, variant = 'danger' }){
    return(
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop locale per la card */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-3xl" onClick={onCancel} />

            <div className="relative bg-white w-full border border-slate-100 shadow-2xl rounded-2xl p-5 animate-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                        <AlertTriangle size={18} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                </div>

                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${
                            variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'
                        }`}
                    >
                        Conferma
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
