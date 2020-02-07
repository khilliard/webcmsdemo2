import React, { useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import Filter from "@material-ui/icons/Filter"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"

// import firebaseApp from "../firebase"
import { StoreContext } from "../App"
import UploadControl from "../components/presentations/UploadControl"
import EditPresentation from "../components/presentations/EditPresentation"
import {
	EDIT_PRESENTATION_STATE,
	UPLOAD_STATE
} from "./../store/reducers/actionTypes"

import CmdButton from "./../components/CmdButton"

const useStyles = makeStyles(theme => ({
	title: {
		display: "flex",
		justifyContent: "space-between",
		marginBottom: "6px"
	},
	inline: {
		display: "inline-block"
	},
	icon: {
		display: "inline-block",
		marginRight: "6px",
		marginLeft: "6px",
		color: "white",
		"&:hover": {
			color: "white"
		}
	},
	items: {
		border: "2px #666666 solid",
		height: "68vh",
		overflowY: "auto",
		background: "rgb(66,66,66)"
	},
	item: {
		display: "flex",
		alignItems: "center",
		color: "white",
		padding: "4px",
		"&:hover": {
			background: `${red[900]}`,
			color: "white",
			cursor: "pointer",
			fontWeight: "bold"
		}
	},
	button: {
		display: "inline-block",
		color: `${amber[500]}`
	}
}))

export default function Presentations(props) {
	// retrieve app state
	const classes = useStyles()
	const { state, dispatch } = useContext(StoreContext)
	console.log(`rendered Presentations - upload state: ${state.uploadState}`)

	return (
		<>
			<div className={classes.title}>
				<Typography className={classes.inline} variant="h6">
					Presentations:
				</Typography>
				<CmdButton action={{ type: UPLOAD_STATE, payload: true }}>
					Upload
				</CmdButton>
			</div>
			<div className={classes.items}>
				{state.presentations.map(doc => {
					return (
						<div
							className={classes.item}
							key={doc.id}
							onClick={() => {
								dispatch({ type: EDIT_PRESENTATION_STATE, payload: doc })
							}}
						>
							<Filter className={classes.icon} />
							<Typography style={{ display: "inline-block" }}>
								{doc.data().name}
							</Typography>
						</div>
					)
				})}
			</div>
			{/* Conditionally display Upload or Edit presentation dialog popups */}
			{/* Display state controlled by dispatched reducer actions triggered by (button click) events */}
			{state.editPresentationState ? <EditPresentation /> : null}
			{state.uploadState ? <UploadControl /> : null}
			<div>Click to edit/delete or assign presentation to TV</div>
		</>
	)
}
