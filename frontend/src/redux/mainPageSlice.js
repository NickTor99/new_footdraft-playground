import { createSlice } from '@reduxjs/toolkit'

export const mainPageSlice = createSlice({
    name: 'mainPageSlice',
    initialState:{
        IsOpenSidebar: false,
        feedback:{
            message: "",
            type: "",
            duration: 5000,
            active: false
        }
    },
    reducers: {
        setIsOpenSidebar: (state) => {
            state.IsOpenSidebar = !state.IsOpenSidebar
        },
        setFeedback: (state, value) => {
            if(value.payload === null) state.feedback.active = false
            else {
                state.feedback.message = value.payload.message
                state.feedback.type = value.payload.type
                state.feedback.duration = value.payload.duration
                state.feedback.active = true
            }
        }
    }
})

export const {setIsOpenSidebar, setFeedback} = mainPageSlice.actions

export default mainPageSlice.reducer