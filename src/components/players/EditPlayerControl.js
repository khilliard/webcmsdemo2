import React, { useState, useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"
import cyan from "@material-ui/core/colors/cyan"

import firebaseApp from "../../firebase"
import { StoreContext } from "../../App"
import { EDIT_PLAYER_STATE } from "../../store/reducers/actionTypes"

import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button
} from "@material-ui/core"

const useStyles = makeStyles(theme => ({
	popupTitle: {
		color: `${amber[500]}`
	},
	dialogContent: {
		width: "100%",
		marginTop: "-18px",
		marginBottom: "6px"
	},
	uploadButton: {
		textTransform: "none"
	},
	messageContent: {
		marginTop: "4px",
		height: "24px",
		color: `${amber[500]}`
	},
	confirm: {
		display: "flex",
		justifyContent: "center"
	},
	input: {
		width: "100%"
	},
	actionButton: {
		marginLeft: "8px",
		textTransform: "none"
	},
	actions: {
		marginTop: "20px"
	}
}))

export default function EditPlayerControl() {
	const { state, dispatch } = useContext(StoreContext)
	const classes = useStyles()

	// retrieve player doc passed via state variable
	const player = state.editPlayerState
	const playerData = player.data()
	const [name, setName] = useState(playerData.name)
	const [location, setLocation] = useState(playerData.location)
	const [waiting, setWaiting] = useState(false)
	const [confirm, setConfirm] = useState(false)

	const authCode = playerData.authcode

	const handlePopupClose = () => {
		dispatch({ type: EDIT_PLAYER_STATE, payload: false })
	}

	const deletePlayer = async () => {
		try {
			await firebaseApp.deleteDocument(player)
			console.log("media player successfully deleted")
		} catch (error) {
			console.log("***** detected error", error)
		}
		handlePopupClose()
	}

	const updatePlayer = async e => {
		e.preventDefault()
		console.log(
			`updating player - name: ${name}, location: ${location}, auth: ${authCode}`
		)
		setWaiting(true)
		try {
			await firebaseApp.updateDocument(player, {
				name: name,
				location: location
			})
		} catch (error) {
			console.log("***** detected error", error)
		}
		handlePopupClose()
	}

	////////////////////////////////////////////////////////////////////////////
	// display dialog popup that allows user to confirm presentation delete 	//
	////////////////////////////////////////////////////////////////////////////
	const Confirm = () => {
		return (
			<Dialog open={true} onClose={() => setConfirm(false)}>
				<DialogTitle style={{ background: `${red[500]}` }}>
					Confirm Delete
				</DialogTitle>
				<DialogContent>Delete presentation?</DialogContent>
				<DialogActions className={classes.confirm}>
					<Button
						onClick={() => {
							setConfirm(false)
							deletePlayer()
						}}
					>
						Yes
					</Button>
					&nbsp;&nbsp;
					<Button onClick={() => setConfirm(false)}>No</Button>
				</DialogActions>
			</Dialog>
		)
	}

	return (
		<>
			<Dialog open={true} fullWidth={true} onClose={handlePopupClose}>
				<DialogTitle className={classes.DialogTitle}>Edit Player</DialogTitle>
				<DialogContent className={classes.dialogContent}>
					<form onSubmit={e => updatePlayer(e)}>
						<TextField
							className={classes.input}
							label="Player name"
							required
							value={name}
							onChange={e => setName(e.target.value)}
						/>
						<TextField
							className={classes.input}
							label="Player location (optional)"
							value={location}
							onChange={e => setLocation(e.target.value)}
						/>
						<div className={classes.actions}>
							<Button
								className={classes.actionButton}
								type="submit"
								style={{ color: `${cyan[500]}` }}
								variant="outlined"
								disabled={waiting}
							>
								Update
							</Button>
							<Button
								className={classes.actionButton}
								style={{ color: `${red[500]}` }}
								variant="outlined"
								disabled={waiting}
								onClick={() => setConfirm(true)}
							>
								Delete
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
			{confirm ? <Confirm /> : null}
		</>
	)
}
