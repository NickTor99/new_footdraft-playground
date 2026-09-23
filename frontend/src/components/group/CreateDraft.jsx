import React, { useState, useMemo } from 'react';
import {
    X,
    Plus,
    Search,
    Users,
    Trophy,
    Check,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

/**
 * COMPONENTE: CreateDraft
 * Un form modale per la creazione di una nuova sessione di draft.
 */
export default function CreateDraft({ onCreateDraft, onClose, players = [] }) {
    const [formData, setFormData] = useState({
        name: 'prova',
        availablePlayers: players
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Filtra i giocatori in base alla ricerca, escludendo quelli già selezionati
    const filteredPlayers = useMemo(() => {
        return players.filter(player =>
            player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !formData.availablePlayers.some(p => p.playerid === player.playerid)
        );
    }, [players, searchTerm, formData.availablePlayers]);

    const handleTogglePlayer = (player) => {
        setFormData(prev => {
            const isSelected = prev.availablePlayers.find(p => p.playerid === player.playerid);
            if (isSelected) {
                return {
                    ...prev,
                    availablePlayers: prev.availablePlayers.filter(p => p.playerid !== player.playerid)
                };
            } else {
                return {
                    ...prev,
                    availablePlayers: [...prev.availablePlayers, player]
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.availablePlayers.length === 0) return;

        // Chiamata alla funzione passata via props
        onCreateDraft(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">

                {/* Header del Modal */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Nuovo Draft</h2>
                            <p className="text-sm text-slate-500 font-medium">Configura la tua sessione</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Corpo del Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Nome del Draft */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            Nome della Sessione
                            {!formData.name && <AlertCircle className="w-3 h-3 text-red-400" />}
                        </label>
                        <input
                            type="text"
                            placeholder="es. Torneo d'Autunno 2024"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    {/* Selezione Giocatori */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center justify-between">
                            <span>Seleziona Partecipanti</span>
                            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-[11px]">
                {formData.availablePlayers.length} Selezionati
              </span>
                        </label>

                        {/* Ricerca */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cerca per nome..."
                                className="w-full pl-12 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Liste Giocatori */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">

                            {/* Disponibili */}
                            <div className="border border-slate-100 rounded-2xl flex flex-col overflow-hidden bg-slate-50/30">
                                <div className="px-4 py-2 bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase">Disponibili</div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {filteredPlayers.map(player => (
                                        <button
                                            key={player.id}
                                            type="button"
                                            onClick={() => handleTogglePlayer(player)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {player.nickname.charAt(0)}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">{player.nickname}</span>
                                            </div>
                                            <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </button>
                                    ))}
                                    {filteredPlayers.length === 0 && (
                                        <p className="text-[11px] text-slate-400 text-center mt-10 italic">Nessun altro giocatore</p>
                                    )}
                                </div>
                            </div>

                            {/* Selezionati */}
                            <div className="border border-blue-100 rounded-2xl flex flex-col overflow-hidden bg-blue-50/20">
                                <div className="px-4 py-2 bg-blue-100/30 text-[10px] font-bold text-blue-600 uppercase">Incluso nel Draft</div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {formData.availablePlayers.map(player => (
                                        <div
                                            key={player.id}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-blue-100 shadow-sm animate-in slide-in-from-right-2 duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                                    {player.nickname.charAt(0)}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">{player.nickname}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePlayer(player)}
                                                className="p-1 hover:bg-red-50 rounded-md group"
                                            >
                                                <X className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.availablePlayers.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                            <Users className="w-6 h-6 opacity-20" />
                                            <p className="text-[11px] italic">Seleziona i partecipanti</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </form>

                {/* Footer del Modal */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors px-4 py-2"
                    >
                        Annulla
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name || formData.availablePlayers.length === 0}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform active:scale-95 shadow-lg ${
                            !formData.name || formData.availablePlayers.length === 0
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                        }`}
                    >
                        Crea Draft
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}