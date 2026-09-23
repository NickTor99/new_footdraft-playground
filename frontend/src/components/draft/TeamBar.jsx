import { User } from "lucide-react";
import PlayerCard from "./PlayerCard.jsx";
import React from "react";
import StatsWidget from './StatsWidget.jsx'

// Importa StatsWidget se lo hai messo in un file a parte, o definiscilo sopra
// import StatsWidget from './StatsWidget';

export default function TeamBar({ team, owner, max, username, average }) {

    return (
        <div className="h-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 flex items-center px-4 md:px-8 gap-4 relative transition-all">

            {/* Barra colorata laterale */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${owner === 'me' ? 'bg-indigo-500' : 'bg-red-500'}`} />

            {/* 1. Icona Team & Nome */}
            <div className="flex flex-col items-center justify-center w-16 shrink-0">
                <User size={28} className={`${owner === 'me' ? 'text-indigo-500' : 'text-red-500'} mb-1`} />
                <span className={`text-[10px] font-black uppercase text-center leading-tight line-clamp-1`}>{username}</span>
            </div>

            {/* 2. CARD SCORREVOLE */}
            <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-2 h-full">
                {team.map((p, i) => (
                    <div key={i} className="w-32 h-full shrink-0">
                        <PlayerCard player={p} disabled={true} size="sm" reduced={true} modeShow={true}/>
                    </div>
                ))}

                {[...Array(Math.max(0, max - team.length))].map((_, i) => (
                    <div key={`empty-${i}`} className="w-28 h-full shrink-0 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <span className="text-slate-300 text-[10px] font-black">{i + 1 + team.length}</span>
                    </div>
                ))}
            </div>

            {/* Separatore */}
            <div className="hidden md:block w-px h-12 bg-slate-100 mx-2" />

            {/* 3. NUOVO: STATS WIDGET */}
            <div className="hidden md:flex shrink-0">
                <StatsWidget average={average} owner={owner} />
            </div>

            {/* Separatore opzionale tra stats e counter */}
            <div className="hidden md:block w-px h-12 bg-slate-100 mx-2" />

            {/* 4. Counter Giocatori */}
            <div className="hidden md:flex flex-col gap-1 w-16 text-center shrink-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Players</p>
                <p className="text-xl font-black text-slate-800">{team.length}/{max}</p>
            </div>
        </div>
    )
}