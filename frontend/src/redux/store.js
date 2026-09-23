import { configureStore } from '@reduxjs/toolkit'
import mainPageStateReducer from './mainPageSlice.js'
import openGroupFormReducer from "./openGroupFormSlice.js";
import searchGroupReducer from "./seachGroupSlice.js";
import userStateReducer from './userSlice.js'
import groupsStateReducer from './groupsSlice.js'
export default configureStore({
    reducer: {
        mainPageState: mainPageStateReducer,
        isOpenGroupForm: openGroupFormReducer,
        searchGroup: searchGroupReducer,
        userState: userStateReducer,
        groupsState: groupsStateReducer
    },
})