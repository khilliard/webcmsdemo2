import React, { useContext } from "react"

import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"

import { StoreContext } from "../../App"
import ScheduleIcon from "@material-ui/icons/Schedule"
import { EDIT_SCHEDULE_STATE } from "../../store/reducers/actionTypes"

const useStyles = makeStyles(theme => ({
	icon: {
		display: "inline-block",
		marginRight: "6px",
		marginLeft: "6px",
		color: "white",
		"&:hover": {
			color: "white"
		}
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

export default function Schedule({ schedule }) {
	const { dispatch } = useContext(StoreContext)
	const classes = useStyles()

	const scheduleData = schedule.data()

	return (
		<div
			className={classes.item}
			onClick={() => {
				// trigger edit player dialog popup
				dispatch({ type: EDIT_SCHEDULE_STATE, payload: schedule })
			}}
		>
			<ScheduleIcon className={classes.icon} />
			<Typography style={{ display: "inline-block" }}>
				{scheduleData.name}
			</Typography>
		</div>
	)
}
