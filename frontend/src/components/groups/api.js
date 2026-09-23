import {api} from '../../APIWrapper.js'

const API_GROUPS = 'http://localhost:8001/groups'
const API_PLAYERS = 'http://localhost:8001/players'

export async function getGroups() {
    return await api.get(`${API_GROUPS}/me`)
}

export async function createGroup(group) {
    const data = {
        "group_name": group.name,
        "description": group.description,
        "is_private": group.isPrivate,
        "category": group.category,
        "max_member": group.maxMember
    }

    return await api.post(`${API_GROUPS}/`,data)

}

export async function deleteGroup(groupId){
    return await api.delete(`${API_GROUPS}/${groupId}`)
}

export async function leaveGroup(groupId){
    return await api.post(`${API_GROUPS}/${groupId}/leave`)
}

export async function searchGroups(searchValue ){
    return await api.get(`${API_GROUPS}/search?q=${searchValue}`)
}

export const getGroupById = async (groupId) => {

    const group = await api.get(`${API_GROUPS}/${groupId}`)

    group.userrole = await api.get(`${API_GROUPS}/${groupId}/me/role`)

    return group;
};

export async function sendJoinRequest(groupId){
    return await api.post(`${API_GROUPS}/${groupId}/request`)
}

export async function getJoinRequests(groupId){
    return await api.get(`${API_GROUPS}/${groupId}/request/pending`)
}

export async function getMembersByGroup(groupId){
    return await api.get(`${API_GROUPS}/${groupId}/users`)
}

export async function getPlayersByGroup(groupId){
    return await api.get(`${API_PLAYERS}/${groupId}`)
}

export async function createPlayer(groupId, player){
    return await api.post(`${API_PLAYERS}/${groupId}`, player)
}

export async function associatePlayerToUser(groupId, playerId, userId){
    return await api.post(`${API_PLAYERS}/${groupId}/${playerId}/associate`, {'user_id': userId})
}

export async function deletePlayer(groupId, playerId){
    return await api.delete(`${API_PLAYERS}/${groupId}/${playerId}`)
}

export async function processJoinRequest(request_id, newStatus){
    return await api.put(`${API_GROUPS}/request/${request_id}`, {'status': newStatus})
}


