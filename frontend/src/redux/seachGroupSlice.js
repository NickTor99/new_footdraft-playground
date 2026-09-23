import { createSlice } from '@reduxjs/toolkit'

export const searchGroupSlice = createSlice({
    name: 'searchGroup',
    initialState:{
        searchValue: "",
        viewGroups: false,
        selectedGroupId: ""
    },
    reducers: {
        setSearchGroupMenu: (state, value) => {
            if(value.payload.length >= 3){
                state.searchValue = value.payload
                state.viewGroups = true
            }else{
                state.viewGroups = false
            }
        },

        closeSearchGroupMenu: (state) => {
            state.viewGroups = false
        }

    }
})

export const {setSearchGroupMenu, closeSearchGroupMenu} = searchGroupSlice.actions

export default searchGroupSlice.reducer