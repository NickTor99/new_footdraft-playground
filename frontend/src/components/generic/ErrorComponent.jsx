import {AlertCircle} from "lucide-react";
import React from "react";
import {useNavigate} from "react-router-dom";


export default function ErrorComponent({error, fun}){
    const navigate = useNavigate();
    return(
        <div className="bg-white rounded-[32px] border border-red-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Ops! Qualcosa è andato storto</h2>
            <p className="text-slate-500 mb-6 text-sm">{error}</p>
            <button
                onClick={() => fun()}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
                Torna alla Home
            </button>
        </div>
    )
}