import React, { useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"

// import firebaseApp from "../firebase"
import { StoreContext } from "../App"
import CreateScheduleControl from "../components/schedules/CreateScheduleControl"
import EditSchedule from "../components/schedules/EditScheduleControl"
import Schedule from "../components/schedules/Schedule"
import { SCHEDULE_STATE } from "../store/reducers/actionTypes"

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

export default function Schedules(props) {
	// retrieve app state
	const { state } = useContext(StoreContext)
	const classes = useStyles()
	console.log(`Schedules rendered - scheduleState: ${state.scheduleState}`)

	return (
		<>
			<div className={classes.title}>
				<Typography className={classes.inline} variant="h6">
					Schedules:
				</Typography>
				<CmdButton
					action={{ type: SCHEDULE_STATE, payload: true }}
					disabled={state.presentations.length === 0}
				>
					Create
				</CmdButton>
			</div>
			<div className={classes.items}>
				{state.schedules.map(doc => (
					<Schedule key={doc.id} schedule={doc} />
				))}
			</div>
			{/* Conditionally display edit player dialog popup that allows user to edit/delete player */}
			{/* Display state controlled by reducer action (EDIT_PLAYER_STATE) triggered by click events */}
			{state.scheduleState ? <CreateScheduleControl /> : null}
			{state.editScheduleState ? <EditSchedule /> : null}
			<div>Click to edit/delete media player</div>
		</>
	)
}
