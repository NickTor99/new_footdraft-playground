import {Loader2} from "lucide-react";
import React from "react";


export default function LoadingComponent({msg = "Ricerca in corso..."}){
    return(
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="font-bold tracking-tight">{msg}</p>
        </div>
    )
}