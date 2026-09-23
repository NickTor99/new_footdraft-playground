import React from 'react';
import { Plus } from 'lucide-react';
import GroupCard from "./GroupCard.jsx";
import { useState, useEffect } from 'react';
import {getGroups, createGroup} from './api.js'
import { useSelector, useDispatch } from 'react-redux'
import {setIsOpenGroupForm} from "../../redux/openGroupFormSlice.js";
import FormGroup from "./FormGroup.jsx";
import LoadingComponent from "../generic/LoadingComponent.jsx";
import ErrorComponent from "../generic/ErrorComponent.jsx";
import { add, initialize } from '../../redux/groupsSlice.js'
import {setFeedback} from "../../redux/mainPageSlice.js";


function GroupsPage(){
    const isOpenGroupForm = useSelector(state => state.isOpenGroupForm.value)
    const dispatch = useDispatch()

    const groups = useSelector(state => state.groupsState.groups)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Utilizzo del servizio esterno
                const data = await getGroups();
                if (isMounted) dispatch(initialize(data))
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();

        return () => { isMounted = false; };
    }, []);

    async function onCreate(formGroup){
        const group = await createGroup(formGroup)
        group.userrole = "Admin"
        group.membercount = 1
        dispatch(add(group))
        dispatch(setFeedback({type: 'success', message: `Gruppo ${group.groupname} creato con successo`}))
        setLoading(false);
    }

    return (
        <>
        <FormGroup isOpen={isOpenGroupForm} onCreate={onCreate}></FormGroup>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Content Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">I tuoi Gruppi</h1>
                        <p className="dark:text-white text-slate-500 text-sm">Seleziona un gruppo per gestire i tuoi giocatori.</p>
                    </div>
                    <button onClick={() => dispatch(setIsOpenGroupForm())} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg dark:shadow-slate-950 shadow-blue-100 active:scale-95">
                        <Plus size={20} />
                        Crea Gruppo
                    </button>
                </div>

                {loading ? (
                    <LoadingComponent/>
                ) : error ? (
                    <ErrorComponent error={error}/>
                ) : groups ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {
                        groups.map(group => {
                            return <GroupCard key={group.groupid} group={group}/>
                        })
                    }
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400 italic">
                        Nessun dato disponibile per questo gruppo.
                    </div>
                )}
            </div>
        </main>
        </>
    );
}

export default GroupsPage
