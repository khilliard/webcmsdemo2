import { useEffect } from "react"

import firebaseApp from "../firebase"
import { store } from "../store"
import {
	LOGIN_USER,
	UPDATE_RESOURCE,
	CLEAR_RESOURCES,
	LOGOUT_USER
} from "../store/reducers/actionTypes"

let authUnsubscribe
const unsubscribes = []
const resources = ["presentations", "players", "schedules"]

const useFirebase = () => {
	const { dispatch } = store
	console.log("useFirebase called")

	useEffect(() => {
		authUnsubscribe = firebaseApp.auth.onAuthStateChanged(user => {
			console.log("firebase onAuthStateChange listener called")
			// check if user logged in
			if (user) {
				const today = new Date()
				const lastLogin = new Date(Date.parse(user.metadata.lastSignInTime))
				const loginTime = Math.floor((today - lastLogin) / (60000 * 60))
				console.log(
					`firebase onAuthStateChange listener called, user logged in - email: ${user.email}, last login: ${lastLogin}, today: ${today}, total login time: ${loginTime} hours`
				)
				// store firestore user auth object in vuex
				dispatch({ type: LOGIN_USER, payload: user })
				//////////////////////////////////////////////////////////////////////////////////////////////
				// When a user logs in:																																			//
				// Create realtime firestore subscription for each resource (presentations, players, etc.)	//
				// A subscription listener tracks changes (ADD/MODIFY/REMOVE) to firestore resources 				//
				// This allows us to model resources in vuex store and create reactive UI resource elements	//
				//////////////////////////////////////////////////////////////////////////////////////////////
				resources.forEach(resource => {
					subscribeResource(resource)
				})
			}
			// Otherwise user is logged out
			else {
				console.log(
					"firebase onAuthStateChange listener called, user logged out"
				)
				dispatch({ type: LOGOUT_USER })
				unsubscribeResources()
				////////////////////////////////////////////////////////////////////////////////
				// When a user logs out:																											//
				// Clear all realtime firestore resource subscriptions and update vuex models	//
				////////////////////////////////////////////////////////////////////////////////
				// firebaseApp.unsubscribeResources()
				// router.push("/login")
			}
			return () => {
				console.log("***** auth useEffect unloading, unsubscribing listener")
				authUnsubscribe && authUnsubscribe()
			}
		})
	}, [dispatch])

	return firebaseApp
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Create realtime subscription which listens for changes to firestore resource documents 	//
// Syncs firestore resource doc changes (ADD/MODIFY/REMOVE) to vuex (reactive) store				//
// Firestore resources document classes: presentations, players, groups and schedules				//
//////////////////////////////////////////////////////////////////////////////////////////////
const subscribeResource = resource => {
	console.log(`adding listener for resource: ${resource}`)
	const { dispatch } = store
	let user = firebaseApp.auth.currentUser
	// capture returned 'unsubscribe method which is called when user logs out
	const unsubscribe = firebaseApp.db
		.collection("users")
		.doc(user.uid)
		.collection(resource)
		.onSnapshot(snapshot => {
			const docs = snapshot.docs
			docs.sort((d1, d2) => {
				if (d1.data().name < d2.data().name) {
					return -1
				} else {
					return 1
				}
			})
			dispatch({ type: UPDATE_RESOURCE, payload: { resource, docs } })
		})
	unsubscribes.push(unsubscribe)
}

// Remove all realtime resource subscriptions and clear vuex backing store
const unsubscribeResources = () => {
	const { dispatch } = store
	console.log("clearing all realtime resource subscriptions")
	unsubscribes.forEach(unsubscribe => {
		unsubscribe()
	})
	dispatch({ type: CLEAR_RESOURCES })
}

export default useFirebase
