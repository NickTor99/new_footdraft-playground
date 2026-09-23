import {Trophy, Users} from "lucide-react";
import React from "react";
import {useSelector} from "react-redux";

export default function DraftTab({draft}){
    const creator = draft.captain1.username
    let status
    let is_finished = draft.status === "FINISHED"
    let can_join = false
    const {username} = useSelector((state) => state.userState)
    let already_join = false
    console.log(draft)

    if(username === creator) already_join = true
    if (draft.captain2 !== null){
        if(username === draft.captain2.username){
            already_join = true
        }
    }


    if(draft.status === "WAITING_FOR_CAPTAIN2") {
        status = "In attesa del secondo capitano";
        can_join = true
    } else status = "In corso"


    return(
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-blue-200 transition-all">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Trophy size={32} />
                </div>
                <div>
                    <h4 className="text-xl font-black text-slate-800">{draft.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          Creatore: {creator}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Users size={14} /> {draft.participants} Spettatori
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        !is_finished ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {status}
                    </span>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all" onClick={() => window.location.href = `/draft/${draft.sessionId}`}>
                    {already_join? "Riprendi" : is_finished? 'Dettagli' : can_join? "Partecipa" : "Spect"}
                </button>

            </div>
        </div>
    )
}