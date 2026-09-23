import React, {useEffect, useState} from 'react';
import GroupCard from "./GroupCard.jsx";
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, ChevronRight, Search,} from 'lucide-react';
import {getGroupById} from "./api.js";
import ErrorComponent from "../generic/ErrorComponent.jsx";
import LoadingComponent from "../generic/LoadingComponent.jsx";
import {useDispatch } from 'react-redux'
import { remove } from '../../redux/groupsSlice.js'
import {deleteGroup, leaveGroup} from './api.js'


export default function GroupSearched() {
    const dispatch = useDispatch()
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Utilizzo del servizio esterno
                const data = await getGroupById(groupId);
                if (isMounted) setGroup(data);
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (groupId) loadData();

        return () => { isMounted = false; };
    }, [groupId]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm mb-4"
                >
                    <ArrowLeft size={16} /> Torna indietro
                </button>

                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Home</span>
                    <ChevronRight size={12} />
                    <span className="text-blue-600">Risultato Ricerca</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <LoadingComponent/>
                ) : error ? (
                    <ErrorComponent error={error} fun={navigate('/')}/>
                ) : group ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                                <Search size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gruppo Trovato</h1>
                                <p className="text-slate-500 text-sm">Ecco i dettagli del gruppo corrispondente alla tua ricerca.</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <GroupCard group={group}/>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400 italic">
                        Nessun dato disponibile per questo gruppo.
                    </div>
                )}
            </div>
        </div>
    );
}
