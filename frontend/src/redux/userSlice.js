import {createSlice} from "@reduxjs/toolkit";

export const UserSlice =  createSlice({
    name: 'UserState',
    initialState: {
        username: "",
        isLogged: false
    },
    reducers:{
        setUserState: (state, user) => {
            state.username = user.payload
            state.isLogged = true
        }
    }
})

export const {setUserState} = UserSlice.actions

export default UserSlice.reducer