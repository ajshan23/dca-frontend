import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export interface SessionState {
    signedIn: boolean
    token: string | null,
    role: string,
}

const initialState: SessionState = {
    signedIn: false,
    token: null,
    role: ""
}

const sessionSlice = createSlice({
    name: `${SLICE_BASE_NAME}/session`,
    initialState,
    reducers: {
        signInSuccess(state, action: any) {
            state.signedIn = true
            state.token = action.payload.token
            state.role = action.payload.role
        },
        signOutSuccess(state) {
            state.signedIn = false
            state.token = null
            state.role = ""
        },
    },
})

export const { signInSuccess, signOutSuccess } = sessionSlice.actions
export default sessionSlice.reducer
