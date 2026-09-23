import React from 'react';
import { Users, User, Shield, ArrowRight, Lock, Globe, MoreHorizontal, Trash2, LogOut ,UserRoundX} from 'lucide-react';
import {useState} from "react";
import ConfirmDialog from "./ConfirmDialog.jsx";
import {Link, useNavigate} from 'react-router-dom';
import {deleteGroup, leaveGroup, sendJoinRequest} from './api.js'
import {useDispatch } from 'react-redux'
import {remove} from "../../redux/groupsSlice.js";
import {setFeedback} from "../../redux/mainPageSlice.js";


/**
 * Componente GroupCard
 * Visualizza le informazioni essenziali di un gruppo con indicatori di ruolo e privacy.
 */
function GroupCard({ group }){
    const {groupid, groupname, description, membercount, userrole, isprivate, cretorid, maxpeople, category='Amici' } = group;
    const isAdmin = userrole === "Admin"
    const isNotMember = userrole === "Not Member"
    const [showMenu, setShowMenu] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch()

    return (
        <div className="group relative dark:bg-slate-900  bg-white rounded-3xl border dark:border-slate-600 border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Decorazione Superiore / Background Sfumato */}
            <div className={`h-2 w-full ${isAdmin ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-400'}`} />

            {/* Overlay di Conferma */}
            {confirmAction === 'delete' && (
                <ConfirmDialog
                    title="Elimina Gruppo"
                    message={`Sei sicuro di voler eliminare "${groupname}"? Questa azione è irreversibile e tutti i dati andranno persi.`}
                    onConfirm={async () => {
                        await deleteGroup(groupid)
                        dispatch(remove(groupid))
                        navigate('/')
                        dispatch(setFeedback({message:`Gruppo ${groupname} eliminato con successo`, type:"success"}))
                    }}
                    onCancel={() => setConfirmAction(null)}
                    variant="danger"
                />
            )}

            {confirmAction === 'leave' && (
                <ConfirmDialog
                    title="Esci dal Gruppo"
                    message={`Vuoi davvero lasciare "${name}"? Per rientrare dovrai ricevere un nuovo invito.`}
                    onConfirm={async () => {
                        await leaveGroup(groupid)
                        dispatch(remove(groupid))
                        navigate('/')
                        dispatch(setFeedback({message:`Hai abbandonato il gruppo ${name}`, type:"success"}))
                    }}
                    onCancel={() => setConfirmAction(null)}
                    variant="warning"
                />
            )}

            <div className="p-6">
                {/* Header della Card */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${
                            
                            isAdmin ? 'bg-slate-100 text-blue-600 ' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {groupname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold dark:text-slate-300 text-slate-800 text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {groupname}
                                </h3>
                                {isprivate ? (
                                    <Lock size={14} className="text-slate-400" />
                                ) : (
                                    <Globe size={14} className="text-slate-400" />
                                )}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">
                                {category || 'Generale'}
                            </span>
                        </div>
                    </div>

                    {/* Menu a comparsa migliorato */}

                    {!isNotMember &&
                        (
                            <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={`p-2 rounded-xl transition-all ${
                                showMenu ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <MoreHorizontal size={20}/>
                        </button>

                        {showMenu && (
                            <>
                                {/* Overlay invisibile per chiudere il menu cliccando fuori */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />

                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {

                                        isAdmin ? (
                                            <button
                                                onClick={() => {
                                                    setConfirmAction("delete")
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                                Elimina Gruppo
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setConfirmAction("leave")
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                                            >
                                                <LogOut size={16}/>
                                                Esci dal gruppo
                                            </button>
                                        )}
                                </div>
                            </>
                        )}
                    </div>
                        )
                    }
                </div>

                {/* Descrizione */}
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px] dark:text-slate-300">
                    {description || "Nessuna descrizione fornita per questo gruppo."}
                </p>

                {/* Stats e Badge */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Users size={16} className="text-slate-400" />
                            <span className="text-sm font-bold dark:text-slate-300">{membercount}</span>
                        </div>

                        {
                            isNotMember ? (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100">
                                    <UserRoundX size={12} />
                                    <span className="text-[10px] font-bold uppercase">Non Member</span>
                                </div>
                            ):
                            isAdmin ? (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                    <Shield size={12} />
                                    <span className="text-[10px] font-bold uppercase">Admin</span>
                                </div>
                            ):
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                    <User size={12} />
                                    <span className="text-[10px] font-bold uppercase">Member</span>
                                </div>
                        }
                    </div>


                    {
                        isNotMember ? (
                                // INVIO RICHIESTA
                                <button
                                    onClick={async () => {
                                        await sendJoinRequest(groupid)
                                            .then(
                                                (msg) => dispatch(setFeedback({type:"success", message:msg.message}))
                                            )
                                            .catch(
                                                (msg) => dispatch(dispatch(setFeedback({type:"error", message:msg.message})))
                                            )

                                    }}
                                    className="flex items-center gap-2 text-sm font-bold dark:text-blue-400 text-blue-600 hover:gap-3 transition-all"
                                >
                                    Invia richiesta <ArrowRight size={16} />
                                </button>
                        ):
                        (
                            <Link to={'/group/'+groupid}>
                                <button
                                    className="flex items-center gap-2 text-sm font-bold dark:text-blue-400 text-blue-600 hover:gap-3 transition-all"
                                >
                                    Entra <ArrowRight size={16} />
                                </button>
                            </Link>

                        )
                    }

                </div>
            </div>
        </div>
    );
}

export default GroupCard


