import React from 'react';
import { Trophy, Play, Share2 } from 'lucide-react';
import PlayerCard from './PlayerCard'; // Assicurati il percorso sia corretto

export default function DraftSummary({
    myTeam,
    opponentTeam,
    myAverage,
    opponentAverage,
    myUsername,
    opponentUser,
    onStartMatch
}) {

    // Helper per determinare chi vince una stat
    const getStatWinnerClass = (myVal, opVal) => {
        if (myVal > opVal) return "text-indigo-600";
        if (opVal > myVal) return "text-red-600";
        return "text-slate-400";
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-700">

            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 p-6 flex flex-col items-center justify-center shrink-0 z-20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-red-500" />

                <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight mb-2">
                    Draft Completato
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Squadre pronte per la partita
                </p>
            </div>

            {/* MAIN CONTENT - Split View */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* COLONNA SX: MY TEAM */}
                <div className="flex-1 flex flex-col bg-indigo-50/30 border-r border-slate-200 overflow-hidden relative">
                    <div className="p-4 flex items-center gap-3 border-b border-indigo-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                        <div>
                            <h2 className="text-xl font-black text-indigo-900">{myUsername || 'TU'}</h2>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase">Total OVR: <span className="text-lg text-indigo-600">{myAverage?.overall}</span></p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
                            {myTeam.map((p, i) => (
                                <div key={i} className='mb-3'>
                                    <PlayerCard player={p} disabled={true} size="sm" modeShow={true}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLONNA CENTRALE: STATS COMPARISON (Mobile: Ordine 1, Desktop: Centro) */}
                <div className="w-full md:w-80 bg-white border-x border-slate-200 flex flex-col shrink-0 overflow-y-auto order-first md:order-none z-10 shadow-xl">
                    <div className="p-6 text-center border-b border-slate-100">
                        <Trophy className="mx-auto text-yellow-500 mb-2 fill-yellow-500" size={32} />
                        <h3 className="text-sm font-black text-slate-700 uppercase">Confronto Squadre</h3>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                        <ComparisonRow label="VELOCITÀ" myVal={myAverage?.velocita} opVal={opponentAverage?.velocita} />
                        <ComparisonRow label="ATTACCO" myVal={myAverage?.attacco} opVal={opponentAverage?.attacco} />
                        <ComparisonRow label="DIFESA" myVal={myAverage?.difesa} opVal={opponentAverage?.difesa} />
                        <ComparisonRow label="TECNICA" myVal={myAverage?.tecnica} opVal={opponentAverage?.tecnica} />

                        <div className="h-px bg-slate-100 my-4" />

                        <ComparisonRow label="OVERALL" myVal={myAverage?.overall} opVal={opponentAverage?.overall} isBig={true} />
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
                        <button
                            onClick={onStartMatch}
                            className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-slate-900/20"
                        >
                            <Play size={20} fill="currentColor" />
                            Gioca Partita
                        </button>
                    </div>
                </div>

                {/* COLONNA DX: OPPONENT TEAM */}
                <div className="flex-1 flex flex-col bg-red-50/30 border-l border-slate-200 overflow-hidden relative">
                    <div className="p-4 flex items-center justify-end gap-3 border-b border-red-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 text-right">
                        <div>
                            <h2 className="text-xl font-black text-red-900">{opponentUser || 'RIVAL'}</h2>
                            <p className="text-[10px] font-bold text-red-400 uppercase">Total OVR: <span className="text-lg text-red-600">{opponentAverage?.overall}</span></p>
                        </div>
                        <div className="w-2 h-8 bg-red-500 rounded-full" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
                            {opponentTeam.map((p, i) => (
                                <div key={i} className='mb-3'>
                                    <PlayerCard player={p} disabled={true} size="sm" modeShow={true}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Sotto-componente per le righe di confronto
const ComparisonRow = ({ label, myVal = 0, opVal = 0, isBig = false }) => {
    const total = myVal + opVal || 1;
    const myPercent = (myVal / total) * 100;
    const opPercent = (opVal / total) * 100;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-black px-1">
                <span className={myVal > opVal ? "text-indigo-600" : "text-slate-400"}>{Math.round(myVal)}</span>
                <span className="text-slate-300 uppercase tracking-wider text-[10px]">{label}</span>
                <span className={opVal > myVal ? "text-red-600" : "text-slate-400"}>{Math.round(opVal)}</span>
            </div>

            <div className={`flex w-full ${isBig ? 'h-4' : 'h-2'} bg-slate-100 rounded-full overflow-hidden`}>
                <div
                    className={`${isBig ? 'bg-indigo-600' : 'bg-indigo-400'} transition-all duration-1000`}
                    style={{ width: `${50 + (myVal - opVal)}%` }} // Logica visiva bilanciata
                />
                <div className="w-0.5 bg-white z-10" />
                <div
                    className={`${isBig ? 'bg-red-600' : 'bg-red-400'} flex-1 transition-all duration-1000`}
                />
            </div>
        </div>
    );
};