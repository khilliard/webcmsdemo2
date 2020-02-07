import { useMemo } from "react"
import { useImmerReducer } from "use-immer"
import firebaseReducer from "./reducers/reducer"

// export const LOGIN_USER = "LOGIN_USER"
// export const LOGOUT_USER = "LOGOUT_USER"
// export const UPDATE_RESOURCE = "UPDATE_RESOURCE"
// export const CLEAR_RESOURCES = "CLEAR_RESOURCES"

export const initialState = {
	initialized: false,
	isLoggedIn: false,
	user: null,
	presentations: [],
	players: [],
	schedules: [],
	uploadState: false,
	playerState: false,
	scheduleState: false,
	editPresentationState: false,
	editPlayerState: false,
	editScheduleState: false,
	assignState: false
}

export let store

const useStore = () => {
	const [state, dispatch] = useImmerReducer(firebaseReducer, initialState)
	console.log("useStore called - reducer returned state:", state)
	store = useMemo(() => ({ state, dispatch }), [state, dispatch])
	return store
}

export default useStore
