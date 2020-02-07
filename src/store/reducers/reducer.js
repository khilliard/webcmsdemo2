import {
	LOGIN_USER,
	LOGOUT_USER,
	UPDATE_RESOURCE,
	CLEAR_RESOURCES,
	UPLOAD_STATE,
	PLAYER_STATE,
	SCHEDULE_STATE,
	EDIT_PRESENTATION_STATE,
	EDIT_PLAYER_STATE,
	EDIT_SCHEDULE_STATE,
	ASSIGN_STATE
} from "./actionTypes"

const firebaseReducer = (draft, action) => {
	console.log(
		`firebase reducer called - action type: ${action.type}, payload:`,
		action.payload
	)
	switch (action.type) {
		case LOGIN_USER:
			draft.user = action.payload
			// draft.initialized = true
			draft.isLoggedIn = true
			return

		case LOGOUT_USER:
			draft.user = null
			draft.isLoggedIn = false
			draft.initialized = true
			return

		case UPDATE_RESOURCE:
			draft.initialized = true
			draft[action.payload.resource] = action.payload.docs
			return

		case CLEAR_RESOURCES:
			draft.players = []
			draft.schedules = []
			draft.presentations = []
			return

		// manage presentation upload dialog popup display state
		case UPLOAD_STATE:
			draft.uploadState = action.payload
			return

		// manage player create dialog popup display state
		case PLAYER_STATE:
			draft.playerState = action.payload
			return

		// manage schedule create dialog popup display state
		case SCHEDULE_STATE:
			draft.scheduleState = action.payload
			return

		// manage presentation edit dialog popup display state
		case EDIT_PRESENTATION_STATE:
			draft.editPresentationState = action.payload
			return

		// manage player edit dialog popup display state
		case EDIT_PLAYER_STATE:
			draft.editPlayerState = action.payload
			return

		// manage schedule edit dialog popup display state
		case EDIT_SCHEDULE_STATE:
			draft.editScheduleState = action.payload
			return

		case ASSIGN_STATE:
			draft.assignState = action.payload
			return

		default:
			return draft
	}
}

export default firebaseReducer
