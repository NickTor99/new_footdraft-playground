import {Hash} from "lucide-react";

import React from "react";
import SearchGroupItem from "./SearchGroupItem.jsx";


function SearchGroupMenu({groups, onReset}){

    return(
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

            <div className="max-h-[320px] overflow-y-auto">
                {groups.length > 0 ? (
                    <>
                        <div className="px-4 py-2 border-b border-slate-50">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Risultati Suggeriti
                          </span>
                        </div>

                        {groups.map((group) => (
                            <SearchGroupItem key={group.groupid} group={group} onReset={onReset}/>
                        ))}
                    </>
                ) : (
                    /* Empty State */
                    <div className="p-8 text-center">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Hash size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Nessun gruppo trovato</p>
                        <p className="text-xs text-slate-400 mt-1">Controlla il nome o creane uno nuovo</p>
                    </div>
                )}
            </div>

            {/* Action Footer (Optional) */}

        </div>

    )
}

export default SearchGroupMenu