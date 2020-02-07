import React from "react"
import { Route, Redirect } from "react-router-dom"

////////////////////////////////////////////////////////////////
// Route if user authenticated, otherwise redirect to Login 	//
////////////////////////////////////////////////////////////////
export default function ProtectedRoute(props) {
	const { store, path, component, exact = false } = props
	// if logged in pass expected route through
	if (store.state.isLoggedIn)
		return <Route exact={exact} path={path} component={component} />
	else return <Redirect to="/login" />
}
