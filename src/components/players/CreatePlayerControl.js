import React, { useState, useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Button } from "@material-ui/core"

import amber from "@material-ui/core/colors/amber"

import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField
} from "@material-ui/core"

import firebaseApp from "../../firebase"
import { StoreContext } from "../../App"
import { PLAYER_STATE } from "../../store/reducers/actionTypes"

const useStyles = makeStyles(theme => ({
	popupTitle: {
		color: `${amber[500]}`
	},
	button: {
		display: "inline-block",
		color: `${amber[500]}`
	},
	dialogContent: {
		width: "100%",
		marginTop: "-18px",
		marginBottom: "6px"
	},
	input: {
		width: "100%"
	},
	actionButton: {
		marginLeft: "8px"
	},
	actions: {
		marginTop: "20px"
	},
	messageContent: {
		marginTop: "4px",
		height: "24px",
		color: `${amber[500]}`
	}
}))

function genAuthCode() {
	const authcode = window.crypto
		.getRandomValues(new Uint32Array(1))[0]
		.toString(16)
		.toUpperCase()
	console.log(`generated auth code: {authcode}`)
	return authcode
}

export default function CreatePlayerControl() {
	const [name, setName] = useState("")
	const [location, setLocation] = useState("")
	const [waiting, setWaiting] = useState(false)

	const classes = useStyles()
	const { state, dispatch } = useContext(StoreContext)

	// trigger close of create dialog popup
	const handlePopupClose = () => {
		dispatch({ type: PLAYER_STATE, payload: false })
	}

	// create player doc in firestore database
	const createPlayer = e => {
		e.preventDefault()
		const authCode = genAuthCode()
		console.log(
			`creating player - name: ${name}, location: ${location}, auth code: ${authCode}`
		)
		setWaiting(true)
		try {
			// Create new player document on firestore database
			firebaseApp.addDocument("players", {
				name: name,
				location: location,
				authcode: authCode
			})
		} catch (error) {
			console.log("detected error adding player to firestore database", error)
		}
		handlePopupClose()
	}

	return (
		<Dialog
			open={state.playerState}
			fullWidth={true}
			onClose={handlePopupClose}
		>
			<DialogTitle className={classes.popupTitle}>Create Player</DialogTitle>
			<DialogContent className={classes.dialogContent}>
				<form onSubmit={e => createPlayer(e)}>
					<TextField
						className={classes.input}
						required
						label="Player name"
						value={name}
						onChange={e => {
							setName(e.target.value)
						}}
					/>
					<TextField
						className={classes.input}
						label="Player location (optional)"
						value={location}
						onChange={e => {
							setLocation(e.target.value)
						}}
					/>
					<div className={classes.actions}>
						<Button
							className={classes.actionButton}
							type="submit"
							style={{ color: `${amber[500]}` }}
							disabled={waiting}
							variant="outlined"
						>
							Create
						</Button>
						<Button
							className={classes.actionButton}
							variant="outlined"
							onClick={() => handlePopupClose()}
						>
							Cancel
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
