import {api} from '../../APIWrapper.js'

const API_DRAFT = 'http://localhost:8002/draft'

const API_PLAYERS = 'http://localhost:8001/players'

export async function createDraft(name, availablePlayers, groupId){
    const data = {
        "availablePlayers": availablePlayers.map(p => p.playerid),
        "name": name
    }
    console.log(data)
    return await api.post(`${API_DRAFT}/${groupId}/create`,data)
}

export async function getDraftSession(sessionId){
    return await api.get(`${API_DRAFT}/${sessionId}`)
}

export async function getDraftsByGroup(groupId){
    return await api.get(`${API_DRAFT}/group/${groupId}`)
}

export async function joinSession(sessionId){
    return await api.post(`${API_DRAFT}/${sessionId}/join`)
}

export async function send_evens_odds_choice(sessionId, choice){
    console.log(choice)
    return await api.post(`${API_DRAFT}/${sessionId}/evens-odds`, choice)
}

export async function get_players_details(groupId, playersId){
    return await api.post(`${API_PLAYERS}/info/${groupId}`, playersId)
}

export async function pickPlayer(sessionId, playerId){
    return await api.post(`${API_DRAFT}/${sessionId}/${playerId}/select-player`, )
}