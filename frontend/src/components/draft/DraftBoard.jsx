import {Bot, User, Zap} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {get_players_details} from './api_draft.js'
import PlayerCard from "./PlayerCard.jsx";
import TeamBar from "./TeamBar.jsx";
import DraftSummary from "./DraftSummary.jsx";

export default function DraftBoard({aPlayers, mTeam, oTeam, handlePick, myTurn, groupId, draftMove, myUsername, opponentUser, isFinished}){
    const [animatingPlayer, setAnimatingPlayer] = useState(null);
    const { sessionId } = useParams();

    const [availablePlayers, setAvailablePlayers] = useState([])
    const [myTeam, setMyTeam] = useState([])
    const [opponentTeam, setOpponentTeam] = useState([])
    const [myAverage, setMyAverage] = useState(null)
    const [opponentAverage, setOpponentAverage] = useState(null)

    function saveToLocalStorage(p){
        localStorage.setItem(
            p.playerid, JSON.stringify({
                'playerId': p.playerid,
                'nickname': p.nickname,
                "velocita": p.velocita,
                "attacco": p.attacco,
                "difesa": p.difesa,
                "tecnica": p.tecnica,
                "avatar": p.avatar,
            })
        )
    }

    // Funzione Helper per calcolare le medie (puoi metterla fuori dal componente o in un file utils)
    const calculateTeamStats = (team) => {
        if (!team || team.length === 0) return null;

        const total = team.reduce((acc, p) => {
            // Calcolo Overall del singolo giocatore se non esiste
            const pOverall = (p.velocita + p.attacco + p.difesa + p.tecnica) / 4;

            return {
                velocita: acc.velocita + p.velocita,
                attacco: acc.attacco + p.attacco,
                difesa: acc.difesa + p.difesa,
                tecnica: acc.tecnica + p.tecnica,
                overall: acc.overall + pOverall
            };
        }, { velocita: 0, attacco: 0, difesa: 0, tecnica: 0, overall: 0 });

        const count = team.length;

        return {
            velocita: Math.round(total.velocita / count),
            attacco: Math.round(total.attacco / count),
            difesa: Math.round(total.difesa / count),
            tecnica: Math.round(total.tecnica / count),
            overall: Math.round(total.overall / count) // Media generale
        };
    };

// --- IL TUO USE EFFECT ---

    useEffect(() => {
        // 1. Gestione Animazione
        if (draftMove !== null) {
            onMove(draftMove.player, draftMove.who);
        }

        const syncData = async () => {
            // Uniamo tutti gli ID necessari e rimuoviamo duplicati
            const allIds = [...new Set([...aPlayers, ...mTeam, ...oTeam])];

            const playersMap = {}; // Mappa temporanea { id: playerObj }
            const missingIds = [];

            // 2. Controllo LocalStorage: Se c'è lo uso, altrimenti lo segno come mancante
            allIds.forEach(id => {
                const cached = localStorage.getItem(id);
                if (cached) {
                    playersMap[id] = JSON.parse(cached);
                } else {
                    missingIds.push(id);
                }
            });

            // 3. Fetch Ottimizzata: Scarico SOLO se ci sono ID mancanti
            if (missingIds.length > 0) {
                try {
                    // Assumo che get_players_details ritorni un array di oggetti player
                    const newPlayers = await get_players_details(groupId, missingIds);

                    newPlayers.forEach(p => {
                        saveToLocalStorage(p); // Salva nel LS
                        playersMap[p.playerId] = p;  // Aggiungi alla mappa in memoria
                    });
                } catch (error) {
                    console.error("Errore recupero dettagli giocatori:", error);
                }
            }

            // 4. Idratazione delle liste (Convertiamo gli array di ID in array di Oggetti Player)
            // Usiamo playersMap che ora contiene sia i dati da LS che quelli freschi dalla API
            const availableObjs = aPlayers.map(id => playersMap[id]).filter(Boolean);
            const myTeamObjs = mTeam.map(id => playersMap[id]).filter(Boolean);
            const oppTeamObjs = oTeam.map(id => playersMap[id]).filter(Boolean);

            // 5. Aggiornamento Stato Liste
            setAvailablePlayers(availableObjs);
            setMyTeam(myTeamObjs);
            setOpponentTeam(oppTeamObjs);

            // 6. Calcolo e Aggiornamento Medie
            setMyAverage(calculateTeamStats(myTeamObjs));
            setOpponentAverage(calculateTeamStats(oppTeamObjs));
        };

        syncData();

// Aggiungi le dipendenze corrette: se cambiano i team, ricalcola tutto
    }, [draftMove, aPlayers, mTeam, oTeam, groupId]);

    function onPick(playerId, sessionId){
        handlePick(playerId, sessionId)
    }

    function onMove(player, who) {
        if (animatingPlayer) return;

        // Recupero dati (assumo tu abbia la logica qui)
        const playerData = JSON.parse(localStorage.getItem(player));

        // Renderizzo la carta "Gigante" per l'animazione
        // Nota: puoi passare delle props extra per renderla più grande o dettagliata
        const playerCard = (
            // Definisco QUI quanto deve essere grande la carta animata (es. 250px o 20rem)
            // La PlayerCard dentro riempirà questo spazio al 100%
            <div className="w-64 md:w-80 shadow-2xl rounded-3xl">
                <PlayerCard
                    player={playerData}
                    size="lg" // Attiva solo i font grandi e i dettagli extra
                    disabled={true}
                />
            </div>
        );

        setAnimatingPlayer({
            playerCard: playerCard,
            direction: who === 'me' ? 'down' : 'up'
        });

        // Rimuovi dopo 1s (la durata dell'animazione CSS)
        setTimeout(() => {
            setAnimatingPlayer(null);
        }, 3000);
    }


    return(
        <main className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-700`}>

            {isFinished ? (
                <DraftSummary
                    myTeam={myTeam}
                    opponentTeam={opponentTeam}
                    myAverage={myAverage}           // Calcolato nel tuo useEffect
                    opponentAverage={opponentAverage} // Calcolato nel tuo useEffect
                    myUsername={myUsername}
                    opponentUser={opponentUser}
                    onStartMatch={() => console.log("Start Match Logic Here")} // Qui metti la logica per andare al gioco
                />
            )
            :
            <>

                {/* OVERLAY ANIMAZIONE */}
                {animatingPlayer && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                        {/* Wrapper che gestisce il movimento */}
                        <div className={`
                            ${animatingPlayer.direction === 'up' ? 'animate-shoot-up' : 'animate-shoot-down'}
                            transform will-change-transform
                        `}>
                            {/* Aggiungo un po' di glow/ombra extra per far risaltare la carta mentre è "in volo" al centro dello schermo */}
                            <div className=" rounded-2xl">
                                <span className="font-bold text-3xl text-center">{animatingPlayer.direction === 'down' ? "Hai scelto" : "L'avversario ha scelto"}</span>
                                {animatingPlayer.playerCard}
                            </div>
                        </div>
                    </div>
                )}

                {/* 1. TEAM AVVERSARIO (TOP) */}
                <TeamBar
                    team={opponentTeam}
                    owner='opponent'
                    username={opponentUser}
                    max={(availablePlayers.length + opponentTeam.length + myTeam.length)/2}
                    average={opponentAverage}
                />

                {/* 2. CENTER STAGE */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 relative">

                    <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-20">
                        {availablePlayers.map((player) => {
                            return (
                                <button
                                    key={player.playerId}
                                    onClick={() => myTurn && onPick(player.playerId, sessionId)}
                                    disabled={!!animatingPlayer || !myTurn}
                                    className={`
                                      relative group 
                                      rounded-2xl flex flex-col items-center text-center shadow-sm 
                                      transition-all duration-300 ease-out overflow-hidden
                                     
                                      ${!myTurn || animatingPlayer ? 'opacity-50 cursor-not-allowed grayscale bg-slate-50' : 'bg-transparent'}
                                `}
                                >
                                    <PlayerCard player={player} myTurn={myTurn}/>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. IL MIO TEAM (BOTTOM) */}
                <TeamBar
                    team={myTeam}
                    owner='me'
                    username={myUsername}
                    max={(availablePlayers.length + opponentTeam.length + myTeam.length)/2}
                    average={myAverage}
                />

            </>
            }
        </main>
    )
}

