import {createSlice} from "@reduxjs/toolkit";

export const GroupsSlice = createSlice(
    {
        name: "groupsState",
        initialState: {
            'groups': []
        },
        reducers: {
            remove: (state, group_id) => {
                state.groups.forEach((group, index) =>{
                    if(group.groupid === group_id.payload){
                        state.groups.splice(index, 1)
                    }
                });
            },
            add: (state, group) => {
                state.groups.push(group.payload)
            },
            initialize: (state, groups) => {
                state.groups = [...groups.payload]
            }

        }
    }
)

export const {remove, add, initialize} = GroupsSlice.actions

export default GroupsSlice.reducer