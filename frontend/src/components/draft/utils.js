// --- HELPER FUNCTIONS (da definire fuori dal componente o in un file utils.js) ---

// Determina il ruolo dell'utente corrente
export function getUserRole (session, username){
    if (session.captain1?.username === username) return 'CAPTAIN1';
    if (session.captain2?.username === username) return 'CAPTAIN2';
    return 'SPECTATOR';
}

// Mappa lo stato della sessione alla fase del frontend
export function getGameStatus (status, role) {
    // Logica Turno
    const isCap1Turn = status === 'CAPTAIN1_SELECTING';
    const isCap2Turn = status === 'CAPTAIN2_SELECTING';

    let isMyTurn = false;
    if (role === 'CAPTAIN1' && isCap1Turn) isMyTurn = true;
    if (role === 'CAPTAIN2' && isCap2Turn) isMyTurn = true;

    // Logica Fase
    let phase = 'DRAFT'; // Default fallback

    if (status === 'WAITING_FOR_CAPTAIN2') {
        phase = 'WAITING_FOR_JOIN';
    } else if (status.includes('WAIT_EVENS_ODDS_CHOICE')) {
        // Se sto aspettando una scelta e tocca a me -> PARITY, altrimenti PARITY_WAIT
        const isMyParityTurn =
            (status === 'WAIT_EVENS_ODDS_CHOICE_CAP1' && role === 'CAPTAIN1') ||
            (status === 'WAIT_EVENS_ODDS_CHOICE_CAP2' && role === 'CAPTAIN2');

        phase = isMyParityTurn ? 'PARITY' : 'PARITY_WAIT';
    } else if (status === 'FINISHED') phase = 'DRAFT_FINISHED'

    return { phase, isMyTurn };
};

// Calcola chi ha fatto l'ultima mossa ('me' o 'opponent')
export function getLastMoveActor (lastMove, username, role) {
    if (!lastMove) return null;
    if (role === 'SPECTATOR') return 'opponent';
    // Se l'ID nella mossa corrisponde al mio username, sono io.
    return lastMove.captainId === username ? 'me' : 'opponent';
}

// Configura le squadre in base alla prospettiva
export function getTeamConfig (session, role) {
    const cap1Data = { team: session.captain1?.pickedPlayers || [], name: session.captain1?.username || '' };
    const cap2Data = { team: session.captain2?.pickedPlayers || [], name: session.captain2?.username || '' };

    if (role === 'CAPTAIN2') {
        return {
            myTeam: cap2Data.team, myName: cap2Data.name,
            opTeam: cap1Data.team, opName: cap1Data.name
        };
    }
    // Default per CAPTAIN1 e SPECTATOR (lo spettatore vede Cap1 come "Home")
    return {
        myTeam: cap1Data.team, myName: cap1Data.name,
        opTeam: cap2Data.team, opName: cap2Data.name
    };
}

// utils/auth.js

export const getCurrentUser = () => {
    const token = localStorage.getItem('token'); // O come hai chiamato la chiave
    if (!token) return null;

    try {
        // Decodifica la parte centrale del JWT (Payload)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload).username;
    } catch (e) {
        console.error("Invalid Token", e);
        return null;
    }
};
