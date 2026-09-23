import {Loader2, Zap} from "lucide-react";
import React, {useState} from "react";
import {setFeedback} from "../../redux/mainPageSlice.js";
import {useDispatch} from "react-redux";

export default function CreatePlayer({onCreatePlayer, onClose}){
    const dispatch = useDispatch()
    const [error, setError] = useState()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState("")
    const [formData, setFormData] = useState({
            nickname: '',
            velocita: 75,
            attacco: 75,
            difesa: 75,
            tecnica: 75,
        }
    )

    async function handleForm(e){
        e.preventDefault()
        setIsSubmitting(true);

        await onCreatePlayer(formData)
            .then(
                () => onClose()
            )
            .catch(
                (error) => {
                    dispatch(setFeedback({type: 'error', message: error.message}))
                    setErrorForm(error.message)
                }
            )
            .finally(
                setIsSubmitting(false)
            )
    }


    return(
        <>
        {isSubmitting && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <Loader2 className="absolute top-0 left-0 w-16 h-16 text-blue-600 animate-spin" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-black text-slate-800">Creazione in corso</p>
                    </div>
                </div>
            </div>
        )}
        <form className="space-y-4" onSubmit={handleForm}>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Nome</label>
                    <input
                        type="text"
                        placeholder="es. Kylian Mbappé"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none"
                        value={formData.nickname}
                        onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Velocità</label>
                    <input
                        type="number"
                        placeholder="es. Kylian Mbappé"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none"
                        value={formData.velocita}
                        onChange={(e) => setFormData({...formData, velocita: e.target.value})}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Attacco</label>
                    <input
                        type="number"
                        placeholder="es. Kylian Mbappé"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none"
                        value={formData.attacco}
                        onChange={(e) => setFormData({...formData, attacco: e.target.value})}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Difasa</label>
                    <input
                        type="number"
                        placeholder="es. Kylian Mbappé"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none"
                        value={formData.difesa}
                        onChange={(e) => setFormData({...formData, difesa: e.target.value})}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Tecnica</label>
                    <input
                        type="number"
                        placeholder="es. Kylian Mbappé"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none"
                        value={formData.tecnica}
                        onChange={(e) => setFormData({...formData, tecnica: e.target.value})}
                    />
                </div>
            </div>
            <button className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                Aggiungi al Pool <Zap size={20} />
            </button>
        </form>
        </>
    )
}