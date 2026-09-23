import React, { useState, useEffect } from 'react';
import {
    Users,
    Trophy,
    Clock,
    Check,
    Dices,
    ArrowRight
} from 'lucide-react';
import {useParams, useSearchParams} from "react-router-dom";
import {getDraftSession, joinSession, pickPlayer, send_evens_odds_choice} from "./api_draft.js";
import LoadingComponent from "../generic/LoadingComponent.jsx";
import DraftBoard from "./DraftBoard.jsx";
import {getLastMoveActor, getTeamConfig, getUserRole, getCurrentUser, getGameStatus} from "./utils.js";


/**
 * Componente per la selezione del numero con le mani
 */
const HandSelector = ({ value, selected, onClick }) => {
    const hands = ["✊", "☝️", "✌️", "🤟", "🖖", "🖐️"];
    return (
        <button
            onClick={onClick}
            className={`
        w-16 h-20 md:w-20 md:h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300
        ${selected
                ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-xl shadow-indigo-200 z-10'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 grayscale hover:grayscale-0'
            }
      `}
        >
            <span className="text-3xl md:text-4xl mb-2">{hands[value]}</span>
            <span className={`text-xs font-black ${selected ? 'text-white' : 'text-slate-400'}`}>{value}</span>
        </button>
    );
};

export default function DraftPage() {
    const { sessionId } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const username = getCurrentUser()
    const [isMounted, setIsMounted] = useState(false)
    const [isFinished, setIsFinished] = useState(false)

    // --- DRAFT STATE  ---
    const [name, setName] = useState('')
    const [isCaptain1, setIsCaptain1] = useState(false);
    const [isSpec, setIsSpec] = useState(false)
    const [myUsername, setMyUsername] = useState('')
    const [opponentUsername, setOpponentUsername] = useState('')

    const [isCaptain2Joined , setIisCaptain2Joined] = useState(false)
    // phases: 'WAITING_FOR_JOIN' | 'PARITY' | 'DRAFT'
    const [phase, setPhase] = useState('WAITING_FOR_JOIN');
    const [isMyTurn, setIsMyTurn] = useState(false); // Determinato dal pari/dispari
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [myTeam, setMyTeam] = useState([]);
    const [opponentTeam, setOpponentTeam] = useState([]);
    const [timer, setTimer] = useState(30);
    const [session, setSession] = useState(null);
    const [movePlayer, setMovePlayer] = useState(null)

    // State Pari/Dispari
    const [parityChoice, setParityChoice] = useState(null); // 'even' | 'odd'
    const [handChoice, setHandChoice] = useState(null); // 0-5
    const [parityResult, setParityResult] = useState(null); // Risultato del calcolo



// --- COMPONENTE REFACTORIZZATO ---

    const buildSession = (newSession) => {
        console.log(newSession)
        // 1. Setup Base
        setSession(newSession);
        setName(newSession.name);
        setAvailablePlayers(newSession.availablePlayers);

        // 2. Identificazione Ruolo
        const role = getUserRole(newSession, username);
        setIsCaptain1(role === 'CAPTAIN1');
        setIsSpec(role === 'SPECTATOR');
        setIisCaptain2Joined(!!newSession.captain2);



        // 4. Configurazione Squadre e Nomi (Solo se c'è un avversario o sono spettatore)
        if (newSession.captain2) {
            const { myTeam, opTeam, myName, opName } = getTeamConfig(newSession, role);
            setMyTeam(myTeam);
            setOpponentTeam(opTeam);
            setMyUsername(myName);
            setOpponentUsername(opName);

            // Reset specifici
            setParityChoice("");
            if(role === 'SPECTATOR') setIsMyTurn(false);
        }

        // 5. Calcolo Fase e Turno
        const { phase: newPhase, isMyTurn: newIsTurn } = getGameStatus(newSession.status, role);
        // Se sono spettatore, il turno è sempre false (gestito sopra o qui forzato)
        setIsMyTurn(role === 'SPECTATOR' ? false : newIsTurn);

        // 3. Gestione Animazione Ultima Mossa
        if (newSession.lastMove) {
            if (newSession.lastMove.type === "EVENS_ODDS_CHOICE_CAP2") {
                confirmParity(
                    newSession.captain1.initialChoice.number,
                    newSession.captain2.initialChoice.number,
                    newSession.captain1.initialChoice.choice
                );
            } else if (newSession.lastMove.type === "SELECT_PLAYER") {
                setMovePlayer({
                    who: getLastMoveActor(newSession.lastMove, username, role),
                    player: newSession.lastMove.value
                });
            }
        }
        setPhase(newPhase);

        setIsMounted(true);
    };

    const join = async (sessionId) =>{
        await joinSession(sessionId)
            .catch((response) => {

            })
    }

    const setUpWebSocket = (sessionId) => {
        const ws = new WebSocket(`ws://localhost:8002/draft/${sessionId}`);

        ws.onopen = () => {
            console.log('Connesso al server WebSocket');
        };

        // 2. Gestione dei messaggi in arrivo
        ws.onmessage = (event) => {
            const session = JSON.parse(event.data);
            console.log('aggiornamento tramite websocket')

            // Aggiornamento dello stato: usiamo la funzione di callback (prev)
            // per assicurarci di non perdere messaggi a causa della natura asincrona
            buildSession(session)
        };

        ws.onclose = () => {
            console.log('Connessione chiusa');
        };

        // 3. CLEANUP: Chiude la connessione quando il componente viene smontato
        return () => {
            ws.close();
        };
    }

    useEffect( () => {
        // Recupero e build della sessione
        const getSession = async (sessionId) => {
            await getDraftSession(sessionId)
                .then((response) =>{
                    const session = JSON.parse(response)
                    buildSession(session)
                })
        }

        getSession(sessionId)

        //Setup websocket
        setUpWebSocket(sessionId)

        if(isMounted){
            // Invio della richiesta di join se necessario
            if(!isCaptain2Joined && !isCaptain1) join(sessionId)
        }

    }, [isMounted])


    // Logica Conferma Pari/Dispari
    function confirmParity (n1, n2, parityChoice) {
        console.log(parityChoice)
        let oppositeChoice
        if (parityChoice === 'Odd') oppositeChoice = 'Even'
        else if (parityChoice === 'Even') oppositeChoice = 'Odd'
        let opponentHand = n1
        let myHand = n2
        let myChoice = oppositeChoice
        let opponentChoice = parityChoice

        if(isCaptain1 || isSpec){
            opponentHand = n2
            myHand = n1
            myChoice = parityChoice
            opponentChoice = oppositeChoice
        }

        // Simulazione Logica Backend
        const total = n1 + n2;
        const isTotalEven = total % 2 === 0;
        const iWon = (isTotalEven && myChoice === 'Even') || (!isTotalEven && myChoice === 'Odd');

        setParityResult({
            parityChoice,
            total,
            iWon,
            myHand,
            myChoice,
            opponentHand,
            opponentChoice
        });

        // Ritardo per mostrare il risultato e poi iniziare
        setTimeout(() => {
            setTimer(60); // Start timer
            setParityResult(null)
        }, 8000);
    }

    // Logica Selezione Draft
    async function handlePick (playerId, sessionId){
        await pickPlayer(sessionId, playerId)
            .then()
            .catch()
    }

    async function sendEvensOddsChoice(parityChoice, handChoice) {
        const data = {
            'choice': isCaptain1 ? parityChoice: null,
            'number': handChoice
        }
        await send_evens_odds_choice(sessionId, data)
            .then(

            )
            .catch(

            )
    }

    return (
        <div className="h-screen bg-slate-100 font-sans text-slate-900 flex flex-col overflow-hidden relative">
            {isMounted  ? (
                <>
                    {/* OVERLAY RISULTATO SORTEGGIO - Fuori dai controlli di Phase se possibile, o dentro un fragment root */}
                    {parityResult && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">

                            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 text-center relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

                                {/* Coriandoli o sfondo colorato in caso di vittoria */}
                                {parityResult.iWon && <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />}
                                {!parityResult.iWon && <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />}

                                <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-8">
                                    Risultato Sorteggio
                                </h2>

                                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-8">
                                    La tua scelta: {parityResult.myChoice === 'Even' ? 'PARI' : 'DISPARI'}
                                </h3>

                                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10">
                                    {/* TU */}
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Tu</p>
                                        <div className="w-20 h-28 sm:w-24 sm:h-32 bg-indigo-600 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-4 border-indigo-200 shadow-xl transform hover:scale-105 transition-transform">
                                            {["✊", "☝️", "✌️", "🤟", "🖖", "🖐️"][parityResult.myHand]}
                                        </div>
                                        <p className="font-black text-xl mt-3 text-indigo-600">{parityResult.myHand}</p>
                                    </div>

                                    <div className="text-4xl font-black text-slate-300 pt-6">+</div>

                                    {/* RIVAL */}
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Rival</p>
                                        <div className="w-20 h-28 sm:w-24 sm:h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-4 border-slate-200 shadow-inner">
                                            {["✊", "☝️", "✌️", "🤟", "🖖", "🖐️"][parityResult.opponentHand]}
                                        </div>
                                        <p className="font-black text-xl mt-3 text-slate-500">{parityResult.opponentHand}</p>
                                    </div>
                                </div>

                                {/* RISULTATO MATEMATICO */}
                                <div className="mb-8 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Somma Totale</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-5xl font-black text-slate-800">{parityResult.total}</span>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                            parityResult.total % 2 === 0
                                                ? 'bg-indigo-100 text-indigo-600 border-indigo-200'
                                                : 'bg-purple-100 text-purple-600 border-purple-200'
                                        }`}>
                        {parityResult.total % 2 === 0 ? 'PARI' : 'DISPARI'}
                    </span>
                                    </div>
                                </div>

                                {/* MESSAGGIO VITTORIA/SCONFITTA */}
                                <div className={`p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors ${
                                    parityResult.iWon
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-red-50 text-red-500 border border-red-100'
                                }`}>
                                    {parityResult.iWon ? (
                                        <><Check size={24} /> Hai vinto! Inizi tu.</>
                                    ) : (
                                        <><Users size={24} /> Hai perso. Inizia l'avversario.</>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {phase === 'WAITING_FOR_JOIN' && (
                        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                            <LoadingComponent msg={"IN ATTESA DELL'AVVERSARIO"}/>
                        </div>
                    )}

                    {/* --- OVERLAY PARITY CHECK (MORRA) --- */}
                    {phase === 'PARITY' && (
                        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                                <div className="p-8 md:p-12 text-center">
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Dices size={32} />
                                    </div>

                                    <h2 className="text-3xl font-black text-slate-800 mb-2">Chi inizia?</h2>

                                    {/* Scelta Pari / Dispari */}
                                    {isCaptain1 && (
                                        <div className="flex gap-4 justify-center mb-10">
                                            <button
                                                onClick={() => setParityChoice('Even')}
                                                className={`px-8 py-4 rounded-2xl font-black text-lg transition-all border-2 ${
                                                    parityChoice === 'Even'
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                                                }`}
                                            >
                                                PARI
                                            </button>
                                            <button
                                                onClick={() => setParityChoice('Odd')}
                                                className={`px-8 py-4 rounded-2xl font-black text-lg transition-all border-2 ${
                                                    parityChoice === 'Odd'
                                                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-purple-300'
                                                }`}
                                            >
                                                DISPARI
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-slate-500 mb-10 font-medium">Scegli la tua previsione e il numero da giocare.</p>

                                    {/* Scelta Mano */}
                                    <div className="mb-10">
                                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">La tua mano</p>
                                        <div className="flex justify-center gap-2 md:gap-4">
                                            {[0, 1, 2, 3, 4, 5].map((num) => (
                                                <HandSelector
                                                    key={num}
                                                    value={num}
                                                    selected={handChoice === num}
                                                    onClick={() => setHandChoice(num)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        disabled={parityChoice === null || handChoice === null}
                                        onClick={() => sendEvensOddsChoice(parityChoice, handChoice)}
                                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        Lancia la sfida <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {phase === 'PARITY_WAIT' && (
                        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                            <LoadingComponent msg={isSpec ? "IN ATTESA DELLE MOSSE DEI CAPITANI": "IN ATTESA CHE L'AVVERSARIO SCELGA UN NUMERO"}/>
                        </div>
                    )}

                    {phase.includes("DRAFT") && (
                        <>
                            {/* --- TOP BAR (Draft Phase) --- */}
                            <header className="bg-white border-b border-slate-200 z-30 shadow-sm shrink-0 h-16 transition-opacity duration-500">
                                <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                            <Trophy size={16} />
                                        </div>
                                        <div>
                                            <h1 className="text-sm font-black tracking-tight">DRAFT</h1>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{name}</p>
                                        </div>
                                    </div>


                                    {phase.includes('FINISHED') ?
                                        <div className={'flex items-center rounded-full px-4 py-1.5 text-white gap-3 shadow-lg transition-colors duration-300 bg-indigo-600'}>
                                            <span className="text-xs font-bold">
                                                DRAFT CONCLUSO
                                            </span>
                                        </div>

                                        :
                                        <div className={`flex items-center rounded-full px-4 py-1.5 text-white gap-3 shadow-lg transition-colors duration-300 ${
                                            isSpec? 'bg-slate-500': isMyTurn ? 'bg-indigo-600' : 'bg-red-600'
                                        }`}>
                                            <div className="flex items-center gap-2 border-r border-white/20 pr-3">
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                                                    {isSpec? 'Spec': isMyTurn ? 'TU' : 'Riv'}
                                                </div>
                                                {isSpec ?
                                                    <span className="text-xs font-bold">Tocca a {session.captain1.username}</span>
                                                    :
                                                    <span className="text-xs font-bold">{isMyTurn ? 'Tocca a te' : 'Turno Avversario'}</span>

                                                }
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono">
                                            <span className={timer < 10 ? 'text-red-200 animate-pulse' : 'text-white'}>
                                                00:{timer < 10 ? `0${timer}` : timer}
                                            </span>
                                                <Clock size={14} className="text-white/60" />

                                            </div>
                                        </div>
                                    }
                                    <div></div>
                                </div>
                            </header>

                            {/* --- AREA DI GIOCO --- */}
                            <DraftBoard
                                groupId={session.groupId}
                                aPlayers={availablePlayers}
                                mTeam={myTeam}
                                oTeam={opponentTeam}
                                handlePick={handlePick}
                                myTurn={isMyTurn}
                                draftMove={movePlayer}
                                myUsername={myUsername}
                                opponentUser={opponentUsername}
                                isFinished={phase === 'DRAFT_FINISHED'}
                            />
                        </>
                    )}
                </>
            ):

                <></>
            }
        </div>
    );
}