import React, { useState } from "react";
import { Activity, X, Hexagon } from "lucide-react";

// Scegli qui quale variante usare: 'RADAR' o 'MODERN'
const VARIANT = 'RADAR';

const StatsWidget = ({ average, owner }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Fallback sicuro se average è null
    const stats = average || { overall: 0, velocita: 0, attacco: 0, difesa: 0, tecnica: 0 };
    const colorClass = owner === 'me' ? 'text-indigo-600' : 'text-red-600';
    const bgClass = owner === 'me' ? 'bg-indigo-600' : 'bg-red-600';
    const borderClass = owner === 'me' ? 'border-indigo-100' : 'border-red-100';

    // Colore dinamico in base al punteggio (Opzionale)
    const getScoreColor = (score) => {
        if (score >= 85) return "text-emerald-500";
        if (score >= 70) return "text-indigo-500";
        return "text-slate-500";
    };

    /* --- VARIANTE 1: FIFA STYLE (Hexagon + Radar) --- */
    if (VARIANT === 'RADAR') {
        return (
            <div className="relative z-50">
                {/* TRIGGER: Esagono con Overall */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group flex flex-col items-center justify-center w-16 h-16 transition-transform hover:scale-105"
                >
                    <div className="relative flex items-center justify-center">
                        <Hexagon size={48} className={`${getScoreColor(stats.overall)} fill-white stroke-2`} />
                        <span className={`absolute text-sm font-black ${getScoreColor(stats.overall)}`}>
                            {Math.round(stats.overall)}
                        </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-[-4px]">OVR</span>
                </button>

                {/* POPUP: Radar Chart */}
                {isOpen && (
                    <div className={`absolute ${owner === 'me' ? 'bottom-20' : 'top-20'} right-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200`}>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase">Team Stats</h4>
                            <button onClick={() => setIsOpen(false)}><X size={14} className="text-slate-300 hover:text-slate-600"/></button>
                        </div>

                        {/* SVG Radar Chart Semplificato */}
                        <div className="relative w-full aspect-square flex items-center justify-center">
                            {/* Griglia di sfondo */}
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                                <circle cx="50" cy="50" r="30" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                                <circle cx="50" cy="50" r="15" fill="none" stroke="#e2e8f0" strokeWidth="1" />

                                {/* Poligono dei dati */}
                                <polygon
                                    points={`
                                        ${50 + (stats.velocita / 100) * 45},50 
                                        50,${50 + (stats.attacco / 100) * 45} 
                                        ${50 - (stats.difesa / 100) * 45},50 
                                        50,${50 - (stats.tecnica / 100) * 45}
                                    `}
                                    className={`${owner === 'me' ? 'fill-indigo-500/20 stroke-indigo-500' : 'fill-red-500/20 stroke-red-500'}`}
                                    strokeWidth="2"
                                />
                            </svg>
                            {/* Etichette */}
                            <span className="absolute top-0 text-[8px] font-bold text-slate-400">TEC</span>
                            <span className="absolute bottom-0 text-[8px] font-bold text-slate-400">ATT</span>
                            <span className="absolute left-0 text-[8px] font-bold text-slate-400">DIF</span>
                            <span className="absolute right-0 text-[8px] font-bold text-slate-400">VEL</span>
                        </div>

                        {/* Valori testuali sotto */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <StatMini label="VEL" val={stats.velocita} />
                            <StatMini label="ATT" val={stats.attacco} />
                            <StatMini label="DIF" val={stats.difesa} />
                            <StatMini label="TEC" val={stats.tecnica} />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* --- VARIANTE 2: MODERN (Donut + Bars) --- */
    return (
        <div className="relative z-50">
            {/* TRIGGER: Donut Chart */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col items-center group"
            >
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                        <circle
                            cx="24" cy="24" r="20"
                            stroke="currentColor" strokeWidth="4" fill="none"
                            strokeDasharray="126"
                            strokeDashoffset={126 - (126 * stats.overall) / 100}
                            className={`transition-all duration-1000 ${colorClass}`}
                        />
                    </svg>
                    <span className="absolute text-xs font-black text-slate-700">{Math.round(stats.overall)}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 group-hover:text-indigo-500 transition-colors">
                    {isOpen ? 'Chiudi' : 'Media'}
                </span>
            </button>

            {/* POPUP: Bar Stats */}
            {isOpen && (
                <div className="absolute bottom-16 right-[-20px] w-40 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="space-y-3">
                        <BarStat label="Velocità" val={stats.velocita} color="bg-sky-500" />
                        <BarStat label="Attacco" val={stats.attacco} color="bg-rose-500" />
                        <BarStat label="Difesa" val={stats.difesa} color="bg-emerald-500" />
                        <BarStat label="Tecnica" val={stats.tecnica} color="bg-amber-500" />
                    </div>
                </div>
            )}
        </div>
    );
};

// Componenti Helper per i grafici
const StatMini = ({label, val}) => (
    <div className="flex justify-between items-center bg-slate-50 rounded px-2 py-1">
        <span className="text-[8px] font-bold text-slate-400">{label}</span>
        <span className="text-[10px] font-black text-slate-700">{Math.round(val)}</span>
    </div>
);

const BarStat = ({ label, val, color }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
            <span className="text-[9px] font-black text-slate-700">{Math.round(val)}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${val}%` }} />
        </div>
    </div>
);

export default StatsWidget;
