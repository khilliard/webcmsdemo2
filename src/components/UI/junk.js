import React, { useState, useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"

import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField
} from "@material-ui/core"

import firebaseApp from "../../firebase"
import { StoreContext } from "../../App"
import { UPLOAD_STATE } from "../../store/reducers/actionTypes"

const useStyles = makeStyles(theme => ({
	popupTitle: {
		color: `${amber[500]}`
	},
	dialogContent: {
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
		marginTop: "4px",
		height: "24px",
		color: `${amber[500]}`
	}
}))

////////////////////////////////////////////////////////////////////////////////
// Upload component 																													//
// Display popup that allows user to select/upload presentation file to CMS 	//
////////////////////////////////////////////////////////////////////////////////
export default function Upload() {
	const [name, setName] = useState("")
	const [message, setMessage] = useState("")
	const [error, setError] = useState("")

	const classes = useStyles()
	const { state, dispatch } = useContext(StoreContext)

	// trigger closing of upload dialog box
	const handlePopupClose = () => {
		setName("")
		setError("")
		dispatch({ type: UPLOAD_STATE, payload: false })
	}

	// upload selected presentation file to CMS and create Presentation doc in firestore database
	const handleUploadFile = async file => {
		console.log("file selected:", file)
		const user = state.user
		console.log(`user id: ${user.uid}`)
		const now = Date.now()
		// construct storage pathname with a time stamp bit to avoid file name clashes
		const filePath = `users/${user.uid}/presentations/${now}/${file.name}`
		try {
			setError("")
			setMessage("Uploading file to CMS, please wait...")
			await firebaseApp.uploadFile(filePath, file)
			await firebaseApp.addDocument("presentations", {
				name: name,
				filePath: filePath
			})
			console.log("file successfully uploaded")
			handlePopupClose()
		} catch (error) {
			console.log("detected error uploading file", error)
			setMessage("")
			setError("Error uploading file, try again")
		}
	}

	// display upload dialog box when triggered by reducer state
	return (
		<Dialog open={true} fullWidth={true} onClose={handlePopupClose}>
			<DialogTitle className={classes.popupTitle}>
				Upload Presentation to CMS
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
						<label htmlFor="file-select">
							<input
								id="file-select"
								style={{ display: "none" }}
								name="file-select"
								type="file"
								onChange={e => handleUploadFile(e.target.files[0])}
							/>
							<Button
								className={classes.fileInput}
								variant="outlined"
								component="span"
							>
								Select & Upload File
							</Button>
							<Button
								className={classes.fileInput}
								variant="outlined"
								onClick={() => handlePopupClose()}
							>
								Cancel
							</Button>
						</label>
					</div>
				</form>
				<div className={classes.messageContent}>
					{message || error ? (
						<span style={{ color: `${error ? red[500] : amber[500]}` }}>
							{message}
							{error}
						</span>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	)
}
