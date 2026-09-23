import {createSlice} from "@reduxjs/toolkit";

export const openGroupFormSlice = createSlice({
    name: "isOpenGroupForm",
    initialState: {
        "value": false
    },
    reducers:{
        setIsOpenGroupForm: (state) => {
            state.value = !state.value
        }
    }
})

export const {setIsOpenGroupForm} = openGroupFormSlice.actions

export default openGroupFormSlice.reducer