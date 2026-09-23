import React, {useEffect, useMemo, useState} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import {
    Users,
    UserPlus,
    Shield,
    Calendar,
    LayoutDashboard,
    User as UserIcon,
    Settings,
    Search,
    ArrowLeft,
    Filter,
    X,
    Zap,
    Clock,
    Check,
    ShieldCheck,
    Plus
} from 'lucide-react';
import {
    associatePlayerToUser,
    createPlayer, deletePlayer,
    getGroupById,
    getJoinRequests,
    getMembersByGroup,
    getPlayersByGroup,
    processJoinRequest
} from "../groups/api.js";
import {createDraft, getDraftsByGroup} from "../draft/api_draft.js";
import LoadingComponent from "../generic/LoadingComponent.jsx";
import ErrorComponent from "../generic/ErrorComponent.jsx";
import {setFeedback} from "../../redux/mainPageSlice.js";
import {useDispatch, useSelector} from 'react-redux'
import MemberTab from "./MemberTab.jsx";
import DraftTab from "./DraftTab.jsx";
import PlayerTab from "./PlayerTab.jsx";
import CreatePlayer from "./CreatePlayer.jsx";
import CreateDraft from "./CreateDraft.jsx";
import BindPlayer from "./BindPlayer.jsx";
import CreateAvatar from "./CreateAvatar.jsx";
import {api} from "../../APIWrapper.js";



/**
 * Sottocomponenti per la modularità
 */
const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);

const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                : 'text-slate-500 hover:bg-white hover:text-blue-600'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const ModalWrapper = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <div className="p-8 pt-4">{children}</div>
            </div>
        </div>
    );
};

/**
 * Componente Principale: GroupDetailPage
 */
export default function GroupPageDetails() {
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('overview');
    const { groupId } = useParams();
    const navigate = useNavigate()

    const [group, setGroup] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);
    const [players, setPlayers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [drafts, setDrafts] = useState([])
    const {username} = useSelector((state) => state.userState)

    const [bindingPlayer, setBindingPlayer] = useState(null)
    const [avatarPlayer, setAvatarPlayer] = useState(null)

    async function getMembers(groupId){
        await getMembersByGroup(groupId)
            .then((members) => {
                setMembers([...members])
            })
            .catch((err) => {
                setError((err.message))
            })
    }

    async function getRequests(groupId){
        await getJoinRequests(groupId)
            .then((requests) => {
                setRequests([...requests])
            })
            .catch((err) => {
                setError((err.message))
            })
    }

    async function getPlayers(groupId){
        await getPlayersByGroup(groupId)
            .then((players) => {
                setPlayers([...players])
            })
            .catch((err) => {
                setError((err.message))
            })
    }

    async function getDrafts(groupId){
        await getDraftsByGroup(groupId)
            .then((drafts) => {
                const parsed_drafts = drafts.map((d) => JSON.parse(d))
                setDrafts([...parsed_drafts])
            })
            .catch((err) => {
                console.log(err.message)
                setError((err.message))
            })
    }

    async function onCreatePlayer(formPlayer){
        await createPlayer(groupId, formPlayer)
            .then((player) => {
                setPlayers([...players, player])
                dispatch(setFeedback({type: 'success', message: `Giocatore ${player.nickname} creato con successo`}))
            })
            .catch((err) =>{
                setError(err.message)
            })
    }

    async function onDeletePlayer(playerId){
        await deletePlayer(groupId, playerId)
            .then((response) => {
                setPlayers(players.filter((p) => p.playerid !== playerId))
                dispatch(setFeedback({type: 'success', message: `Giocatore ${player.nickname} eliminato con successo`}))
        })
    }

    async function onBindPlayer(playerId, userId){
        await associatePlayerToUser(groupId, playerId, userId)
            .then((response) => {
                dispatch(setFeedback({type: 'success', message: `Giocatore associato con successo`}))
            })
    }

    async function onCreateDraft(formDraft){
        await createDraft(formDraft.name, formDraft.availablePlayers, groupId)
            .then((draft) => {
                console.log(draft)
                dispatch(setFeedback({type: 'success', message: `Draft creato con successo`}))
                window.location.href = `/draft/${draft}?u=${username}`
            })
            .catch((err) =>{
                setError(err.message)
            })
    }

    const loadData = async (isMounted) => {
        setLoading(true);
        setError(null);
        try {
            // Utilizzo del servizio esterno
            const data = await getGroupById(groupId);
            if (isMounted) setGroup(data);
            return data
        } catch (err) {
            if (isMounted) setError(err.message);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (groupId) loadData(isMounted).then((data) =>{
            if (data.userrole === "Admin") setIsAdmin(true)
        });

        getMembers(groupId);
        getPlayers(groupId);
        getDrafts(groupId);

        return () => { isMounted = false; };
    }, [groupId]);

    useEffect(() =>{
        if (isAdmin) getRequests(groupId)
    }, [isAdmin])

    // 2. useMemo per unire i dati (Compute)
    const processedPlayers = useMemo(() => {
        // Se non abbiamo ancora i dati, restituisci array vuoto o loading
        if (!players.length || !members.length) return [];

        // Usiamo map per creare un NUOVO array (non modificare mai lo stato esistente con forEach!)
        return players.map(player => {
            // Troviamo il membro associato
            const linkedMember = members.find(m => m.id === player.linckeduserid);

            // Ritorniamo il giocatore con il membro aggiunto
            return {
                ...player,
                memberDetails: linkedMember // Aggiungiamo i dettagli qui
            };
        });
    }, [players, members]); // <-- Si ricalcola solo quando questi cambiano

    const [modals, setModals] = useState({
        invite: false,
        requests: false,
        createPlayer: false,
        createDraft: false,
        bindPlayer: false,
        createAvatar: false
    });

    const toggleModal = (key, val) => setModals(prev => ({ ...prev, [key]: val }));

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    async function onSaveAvatar(initialBase64String) {
        const response = await api.put(`http://localhost:8001/players/${groupId}/${avatarPlayer}/avatar`, {user_image_base64: initialBase64String})
            .then((updatedPlayer) =>{
                console.log(updatedPlayer)
                toggleModal('createAvatar', false)
                dispatch(setFeedback({type: 'success', message: `Avatar salvato con successo`}))
                // Funzione che gestisce l'aggiornamento
                const updatePlayerState = (updatedPlayer) => {
                    console.log(updatedPlayer)

                    setPlayers((prevPlayers) => {
                        // .map crea un NUOVO array, rispettando l'immutabilità di React
                        return prevPlayers.map((player) => {

                            // 1. Controlliamo se è il giocatore da modificare (tramite ID)
                            if (player.playerid === updatedPlayer.playerid) {
                                // SE CORRISPONDE: Sostituiscilo con quello nuovo arrivato dal server
                                return updatedPlayer;

                                // OPZIONE B (Se vuoi fare un merge, vedi sotto):
                                // return { ...player, ...updatedPlayer };
                            }

                            // 2. ALTRIMENTI: Ritorna il giocatore originale senza toccarlo
                            return player;
                        });
                    });

                };
                updatePlayerState(updatedPlayer)
                setAvatarPlayer(null)
            })
    }

    return (
        <>
        {loading ? (
                <LoadingComponent/>
            ) : error ? (
                <ErrorComponent error={error} fun={navigate('/')}/>
            ) : group ? (
                <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-y-auto">

                    {/* 1. Header del Gruppo */}
                    <div className="bg-white border-b border-slate-100 pb-8 pt-6">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex justify-between items-start mb-6">
                                <button onClick={() => {navigate('/')}} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 font-bold text-sm">
                                    <ArrowLeft size={16} /> Torna ai Gruppi
                                </button>

                                {isAdmin && (
                                    <button
                                        onClick={() => toggleModal('requests', true)}
                                        className="relative flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold text-xs border border-amber-100 hover:bg-amber-100 transition-all"
                                    >
                                        <Users size={16} />
                                        Richieste in attesa
                                        {requests.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                            {requests.length}
                                        </span>
                                        )}
                                    </button>
                                )}
                            </div>


                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
                                        {group.groupname.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{group.groupname}</h1>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg border border-blue-100">
                    {group.category}
                  </span>
                                        </div>
                                        <p className="text-slate-500 max-w-xl text-sm leading-relaxed">{group.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleModal('invite', true)}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                        <UserPlus size={20} /> Invita Amici
                                    </button>
                                    <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100">
                                        <Settings size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Statistiche Quick View */}
                    <div className="max-w-7xl mx-auto px-6 -mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard label="Membri" value={members.length} icon={Users} color="bg-orange-50 text-orange-500" />
                            <StatCard label="Giocatori" value={players.length} icon={Zap} color="bg-purple-50 text-purple-500" />
                            <StatCard label="Prossimo Evento" value="Tra 2gg" icon={Clock} color="bg-blue-50 text-blue-500" />
                        </div>
                    </div>

                    {/* 3. Main Navigation & Content */}
                    <div className="max-w-7xl mx-auto px-6 mt-12">
                        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[22px] w-fit mb-8">
                            <TabButton active={activeTab === 'overview'} label="Panoramica" icon={LayoutDashboard} onClick={() => setActiveTab('overview')} />
                            <TabButton active={activeTab === 'players'} label="Giocatori" icon={Zap} onClick={() => setActiveTab('players')} />
                            <TabButton active={activeTab === 'members'} label="Membri" icon={UserIcon} onClick={() => setActiveTab('members')} />
                            <TabButton active={activeTab === 'drafts'} label="Draft" icon={Calendar} onClick={() => setActiveTab('drafts')} />
                            {group.userrole === "Admin" && activeTab === 'players' && (
                                <button
                                    onClick={() => toggleModal('createPlayer', true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700"
                                >
                                    <Plus size={18} /> Crea Giocatore
                                </button>
                            )}
                            {activeTab === 'drafts' && (
                                <button
                                    onClick={() => toggleModal('createDraft', true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700"
                                >
                                    <Plus size={18} /> Nuovo Draft
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* TAB: OVERVIEW */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                                            <h3 className="text-xl font-black text-slate-800 mb-6">Attività Recente</h3>
                                            <div className="space-y-6">
                                                {[1,2,3].map(i => (
                                                    <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                            <Zap size={18} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-800">
                                                                <span className="font-bold">Mario Rossi</span> ha acquistato <span className="font-bold text-blue-600">K. Mbappé</span> nel Draft Invernale.
                                                            </p>
                                                            <span className="text-[11px] text-slate-400 font-medium">2 ore fa</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* TAB: PLAYERS */}
                            {activeTab === 'players' && (
                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input type="text" placeholder="Cerca giocatore..." className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                        </div>
                                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm border border-slate-100 hover:bg-slate-100">
                                            <Filter size={18} /> Filtri
                                        </button>
                                    </div>
                                    <table className="w-full ">
                                        <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Overall / Giocatore</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">ATT</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">DIF</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">VEL</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">TEC</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Utente</th>
                                            <th className="px-8 py-4"></th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                        {processedPlayers.map(player => (
                                            <PlayerTab key={player.playerid} player={player} onDelete={onDeletePlayer} onBind={() => {setBindingPlayer(player.playerid); toggleModal('bindPlayer', true)}} onCreateAvatar={() => {setAvatarPlayer(player.playerid); toggleModal('createAvatar', true)}}/>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* TAB: MEMBERS */}
                            {activeTab === 'members' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {members.map(member => (
                                        <MemberTab key={member.id} member={member}/>
                                    ))}
                                </div>
                            )}

                            {/* TAB: DRAFTS */}
                            {activeTab === 'drafts' && (
                                <div className="space-y-4">
                                    {drafts.map(draft => (
                                        <DraftTab key={draft.sessionId} draft={draft}/>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                    {/* --- MODALE: RICHIESTE JOIN --- */}
                    <ModalWrapper
                        isOpen={modals.requests}
                        onClose={() => toggleModal('requests', false)}
                        title="Richieste di Accesso"
                    >
                        <div className="space-y-4">
                            {requests.length > 0 ? requests.map(req => (
                                <div key={req.actionid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-800">{req.user.username}</p>
                                        <p className="text-xs text-slate-400">
                                            {req.email} • <span className="text-blue-600 font-semibold">Scade il: {formatDate(req.expire)}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="p-2 bg-white text-red-500 rounded-xl border border-slate-100 hover:bg-red-50 transition-colors"
                                            onClick={async () => {
                                                setLoading(true)
                                                const risp = await processJoinRequest(req.actionid, "REJECTED")
                                                let i = 0
                                                requests.forEach((r, index) =>{
                                                    if(r.actionid === req.actionid) i = index
                                                })
                                                requests.splice(i,1)

                                                setRequests([...requests])
                                                setLoading(false)
                                                dispatch(setFeedback({message: risp.message, type: 'warning'}))
                                            }}

                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setLoading(true)
                                                const risp = await processJoinRequest(req.actionid, "ACCEPTED")
                                                setMembers([...members, risp.user])
                                                let i = 0
                                                requests.forEach((r, index) =>{
                                                    if(r.actionid === req.actionid) i = index
                                                })
                                                console.log(i)
                                                requests.splice(i,1)
                                                console.log(requests)

                                                setRequests([...requests])
                                                setLoading(false)
                                                dispatch(setFeedback({message: risp.message, type: 'success'}))
                                            }}
                                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-8 text-slate-400 italic">Nessuna richiesta pendente.</p>
                            )}
                        </div>
                    </ModalWrapper>

                    {/* --- MODALE: INVITA UTENTE --- */}
                    <ModalWrapper
                        isOpen={modals.invite}
                        onClose={() => toggleModal('invite', false)}
                        title="Invita un Amico"
                    >
                        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                            <p className="text-sm text-slate-500">Invia un invito tramite nickname o email per farli entrare nel gruppo.</p>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nickname o Email</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" placeholder="Cerca utente..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                </div>
                            </div>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                Invia Invito <ShieldCheck size={20} />
                            </button>
                        </form>
                    </ModalWrapper>

                    {/* --- MODALE: CREA GIOCATORE --- */}
                    <ModalWrapper
                        isOpen={modals.createPlayer}
                        onClose={() => toggleModal('createPlayer', false)}
                        title="Nuovo Giocatore Virtuale"
                    >
                        <CreatePlayer onCreatePlayer={onCreatePlayer} onClose={() => toggleModal('createPlayer', false)}/>
                    </ModalWrapper>

                    {/* --- MODALE: CREA DRAFT --- */}
                    <ModalWrapper
                        isOpen={modals.createDraft}
                        onClose={() => toggleModal('createDraft', false)}
                        title="Crea nuova sessione Draft"
                    >
                        <CreateDraft onCreateDraft={onCreateDraft} onClose={() => toggleModal('createDraft', false)} players={players}/>
                    </ModalWrapper>

                    {/* --- MODALE: BIND TRA PLAYER E MEMBER --- */}
                    <ModalWrapper
                        isOpen={modals.bindPlayer}
                        onClose={() => toggleModal('bindPlayer', false)}
                        title="Scegli a chi assegnare il giocatore virtuale"
                    >

                        <div>
                            <BindPlayer members={members} players={processedPlayers} playerId={bindingPlayer} onBind={onBindPlayer}/>
                        </div>
                    </ModalWrapper>

                    {/* --- MODALE: CREATE PLAYER AVATAR --- */}
                    <ModalWrapper
                        isOpen={modals.createAvatar}
                        onClose={() => toggleModal('createAvatar', false)}
                        title="Scegli un immagine"
                    >

                        <div>
                            <CreateAvatar groupId={groupId} playerId={avatarPlayer} onSaveAvatar={onSaveAvatar}/>
                        </div>
                    </ModalWrapper>
                </div>
                ):(
                <div className="text-center py-20 text-slate-400 italic">
                    Nessun dato disponibile per questo gruppo.
                </div>
            )}
        </>
    );
}