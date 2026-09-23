import React, { useState } from 'react';
import {X, Globe, Lock, Users, Loader2, ShieldCheck, AlertCircle} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux'
import {setIsOpenGroupForm} from "../../redux/openGroupFormSlice.js";
import {setFeedback} from "../../redux/mainPageSlice.js";


function CreateGroupModal({ isOpen, onCreate }){
    const dispatch = useDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: 'Daje',
        description: 'cccccccccc',
        isPrivate: false,
        category: 'Competitivo',
        maxMember: 5
    });
    const [errorForm, setErrorForm] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        await onCreate(formData)
            .then(
            () => onClose())
            .catch(
                (error) => {
                    dispatch(setFeedback({type: 'error', message: error.message}))
                    setErrorForm(error.message)
                })
            .finally(
            setIsSubmitting(false)
        )
    };

    const onClose = () => {
        setErrorForm(null)
        dispatch(setIsOpenGroupForm())
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Loading Overlay */}
                {isSubmitting && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                                <Loader2 className="absolute top-0 left-0 w-16 h-16 text-blue-600 animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-800">Creazione in corso</p>
                                <p className="text-sm text-slate-500">Stiamo configurando il tuo gruppo...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Crea Nuovo Gruppo</h2>
                        <p className="text-slate-500 text-sm mt-1">Configura il tuo nuovo ambiente di gioco.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {errorForm && (
                    <div className="
                   mr-5 ml-5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={18} />
                        <span className="font-semibold">{errorForm}</span>
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                    {/* Nome Gruppo */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nome del Gruppo</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="es. Lega Fantacalcio 2024"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Descrizione */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Descrizione (opzionale)</label>
                        <textarea
                            rows="3"
                            placeholder="Di cosa si occupa questo gruppo?"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* Categoria & Privacy */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Categoria</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Competitivo">Competitivo</option>
                                <option value="Social">Social</option>
                                <option value="Training">Training</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Privacy</label>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                                    formData.isPrivate
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {formData.isPrivate ? <Lock size={16} /> : <Globe size={16} />}
                                    <span>{formData.isPrivate ? 'Privato' : 'Pubblico'}</span>
                                </div>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Max. Membri</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="number"
                                    placeholder="es. 4"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.maxMember}
                                    onChange={(e) => setFormData({...formData, maxMember: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={20} />
                            Crea Gruppo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;