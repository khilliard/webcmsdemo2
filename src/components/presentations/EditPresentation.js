import React, { useState, useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"
import cyan from "@material-ui/core/colors/cyan"

import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	DialogActions
} from "@material-ui/core"

import firebaseApp from "../../firebase"
import { StoreContext } from "../../App"
import {
	EDIT_PRESENTATION_STATE,
	ASSIGN_STATE
} from "../../store/reducers/actionTypes"

import Assign from "../players/Assign"

const useStyles = makeStyles(theme => ({
	popupTitle: {
		color: `${amber[500]}`
	},
	dialogContent: {
		width: "100%",
		marginTop: "-18px",
		marginBottom: "6px"
	},
	fileInput: {
		marginTop: "16px",
		marginRight: "8px",
		textTransform: "none"
	},
	uploadButton: {
		textTransform: "none"
	},
	messageContent: {
		marginTop: "8px",
		height: "24px",
		color: `${amber[500]}`
	},
	confirm: {
		display: "flex",
		justifyContent: "center"
	}
}))

////////////////////////////////////////////////////////////////////////////////
// Upload component 																													//
// Display popup that allows user to select/upload presentation file to CMS 	//
////////////////////////////////////////////////////////////////////////////////
export default function EditPresentation() {
	const { state, dispatch } = useContext(StoreContext)
	const presentation = state.editPresentationState
	const presentationData = presentation.data()

	const [waiting, setWaiting] = useState(false)
	const [confirm, setConfirm] = useState(false)
	const [name, setName] = useState(presentationData.name)
	const [message, setMessage] = useState("")

	// presentation doc is passed in state variable
	// retrieve presentation doc's data

	const classes = useStyles()

	console.log(
		"EditPresentation component rendered - presentation:",
		presentation
	)

	////////////////////////////////////////////
	// trigger closing of upload dialog box 	//
	////////////////////////////////////////////
	const handlePopupClose = () => {
		setName("")
		setWaiting(false)
		setConfirm(false)
		dispatch({ type: EDIT_PRESENTATION_STATE, payload: false })
	}

	//////////////////////////////////////////////////////////////////////////////////////////////
	// delete presentation - delete both presentation file from storage and firestore database 	//
	//////////////////////////////////////////////////////////////////////////////////////////////
	const handleDeletePresentation = async () => {
		console.log(
			`deleting presentation - name: ${presentationData.name}, id: ${presentation.id}`
		)
		setWaiting(true)
		setConfirm(false)
		setMessage("Deleting presentation, please wait...")
		const presentationPath = presentation.ref.path
		try {
			// delete uploaded presentation file from firebase storage
			await firebaseApp.deleteFile(presentationData.filePath)
			// delete associated presentation resource object from firestore database
			console.log("file delete completed")
			await firebaseApp.deleteDocument(presentation)
			const promises = []
			// check each player for presentation assignment
			state.players.forEach(player => {
				let data = player.data()
				// check if player assigned to this (soon to be) deleted presentation
				if (data.assignedTo === presentationPath) {
					console.log(
						`removing assigned presentation from player '${data.name}'`
					)
					// undo assignment
					data.assignedTo = null
					promises.push(firebaseApp.updateDocument(player, data))
				}
			})
			// check each schedule for presentation links
			state.schedules.forEach(schedule => {
				let data = schedule.data()
				// check if schedule linked to (soon to be) deleted presentation
				if (data.presentation === presentationPath) {
					// going to delete schedule, so first check player schedule assignments
					state.players.forEach(player => {
						const playerData = player.data()
						// check if player assigned to schedule
						if (playerData.schedule === schedule.ref.path) {
							// undo schedule assignment
							playerData.schedule = null
							promises.push(firebaseApp.updateDocument(player, playerData))
						}
					})
					// delete linked schedule
					promises.push(firebaseApp.deleteDocument(schedule))
				}
			})
			// wait for all the async firestore database updates/deletes to complete
			await Promise.all(promises)
		} catch (error) {
			console.log("detected error deleting presentation", error)
		} finally {
			handlePopupClose()
		}
	}

	////////////////////////////////////////////////////
	// update presentation doc on firestore database 	//
	////////////////////////////////////////////////////
	const handleEditPresentation = async file => {
		setWaiting(true)
		try {
			await firebaseApp.updateDocument(presentation, {
				name
			})
		} catch (error) {
			console.log("detected error updating presentation name", error)
		} finally {
			setWaiting(false)
			handlePopupClose()
		}
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
					<Button onClick={() => handleDeletePresentation()}>Yes</Button>
					&nbsp;&nbsp;
					<Button onClick={() => setConfirm(false)}>No</Button>
				</DialogActions>
			</Dialog>
		)
	}

	////////////////////////////////////////////////////////
	// display dialog allowing user to edit presentation 	//
	////////////////////////////////////////////////////////
	return (
		<div style={{ width: "100%" }}>
			<Dialog open={true} fullWidth={true} onClose={handlePopupClose}>
				<DialogTitle className={classes.popupTitle}>
					Edit Presentation
				</DialogTitle>
				<DialogContent className={classes.dialogContent}>
					<form>
						<TextField
							style={{ width: "100%" }}
							label="Presentation name"
							value={name}
							onChange={e => {
								console.log(`key: ${e.target.value}`)
								setName(e.target.value)
							}}
						/>
						<div>
							<Button
								className={classes.fileInput}
								variant="outlined"
								style={{ color: `${amber[500]}` }}
								disabled={waiting || name.trim().length === 0}
								onClick={() => {
									handleEditPresentation()
								}}
							>
								Update
							</Button>
							<Button
								className={classes.fileInput}
								style={{ color: `${red[500]}` }}
								variant="outlined"
								disabled={waiting}
								onClick={() => setConfirm(true)}
							>
								Delete
							</Button>
							<Button
								className={classes.fileInput}
								style={{ color: `${cyan[500]}` }}
								variant="outlined"
								// trigger (via assignState) assign dialog popup display
								onClick={() => dispatch({ type: ASSIGN_STATE, payload: true })}
							>
								Assign
							</Button>
							<Button
								className={classes.fileInput}
								variant="outlined"
								onClick={() => handlePopupClose()}
							>
								Close
							</Button>
						</div>
					</form>
					<div className={classes.messageContent}>{message}</div>
				</DialogContent>
			</Dialog>
			{confirm ? <Confirm /> : null}
			{state.assignState ? <Assign presentation={presentation} /> : null}
		</div>
	)
}
