import React from "react"
import { Route, Redirect } from "react-router-dom"

////////////////////////////////////////////////////////////////////////////////
// Handle Login and Signup auth page route requests														//
// Redirect to root if user currently logged in otherwise route to auth page 	//
////////////////////////////////////////////////////////////////////////////////
export default function AuthRoute(props) {
	const { store, path } = props
	// if logged in then ignore auth route request, redirect to home
	if (store.state.isLoggedIn) {
		return <Redirect to="/" />
	} else {
		// otherwise allow routing to Login or Signup paths
		return <Route path={path}>{props.children}</Route>
	}
}
