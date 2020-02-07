import React, { useState, useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import Button from "@material-ui/core/Button"
import deepOrange from "@material-ui/core/colors/deepOrange"
import amber from "@material-ui/core/colors/amber"

import firebaseApp from "../../firebase"
import { StoreContext } from "../../App"
import { SCHEDULE_STATE } from "../../store/reducers/actionTypes"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField
} from "@material-ui/core"

const useStyles = makeStyles(theme => ({
	title: {
		background: `${deepOrange[500]}`
	},
	formControl: {
		width: "100%"
	},
	input: {
		width: "100%"
	},
	actionButtons: {
		marginRight: "6px"
	},
	datetime: {
		marginRight: "24px"
	},
	actions: {
		marginTop: "10px",
		marginBottom: "6px"
	},
	actionButton: {
		textTransform: "none",
		marginRight: "6px",
		marginBottom: "6px"
	}
}))

function makeISODate(date) {
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()
	if (month < 10) month = "0" + month
	if (day < 10) day = "0" + day
	return `${year}-${month}-${day}`
}

export default function CreateScheduleControl() {
	const { state, dispatch } = useContext(StoreContext)
	const [name, setName] = useState("")
	const [scheduledPresentation, setScheduledPresentation] = useState(
		state.presentations[0]
	)
	const classes = useStyles()
	const presentations = state.presentations
	const today = new Date()
	const [startDate, setStartDate] = useState(makeISODate(today))
	const [startTime, setStartTime] = useState("00:00")
	const nextYear = new Date(today.setFullYear(today.getFullYear() + 1))
	const [endDate, setEndDate] = useState(makeISODate(nextYear))
	const [endTime, setEndTime] = useState("00:00")
	const [waiting, setWaiting] = useState(false)

	// update scheduled presentation
	const handleChange = doc => {
		setScheduledPresentation(doc)
	}

	const createSchedule = async () => {
		console.log(
			// console.dir(scheduleDoc)
			`name: ${name}, start date: ${startDate}, time: ${startTime}, end date: ${endDate}, time: ${endTime}, presentation:`,
			scheduledPresentation.data()
		)
		const scheduleDoc = {
			name: name,
			presentation: scheduledPresentation.ref.path,
			startTime,
			endTime,
			startDate,
			endDate
		}
		try {
			setWaiting(true)
			await firebaseApp.addDocument("schedules", scheduleDoc)
		} catch (error) {
			console.log("deteted error creating schedule:", error)
		}
		dispatch({ type: SCHEDULE_STATE, payload: false })
	}

	return (
		<div>
			<Dialog open={true}>
				<DialogTitle className={classes.title}>
					Create Presentation Display Schedule
				</DialogTitle>
				<DialogContent>
					<TextField
						className={classes.input}
						label="Description"
						value={name}
						onChange={e => setName(e.target.value)}
					></TextField>
					<FormControl className={classes.formControl}>
						<InputLabel id="demo-simple-select-label">
							Scheduled presentation
						</InputLabel>
						<Select
							value={scheduledPresentation}
							onChange={e => handleChange(e.target.value)}
						>
							{presentations.map(presentation => (
								<MenuItem key={presentation.id} value={presentation}>
									{presentation.data().name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<div>
						<TextField
							className={classes.datetime}
							label="Start date"
							type="date"
							defaultValue={startDate}
							InputLabelProps={{
								shrink: true
							}}
							onChange={e => setStartDate(e.target.value)}
						/>
						<TextField
							className={classes.datetime}
							label="Start time"
							type="time"
							defaultValue={startTime}
							InputLabelProps={{
								shrink: true
							}}
							inputProps={{
								step: 300 // 5 min
							}}
							onChange={e => setStartTime(e.target.value)}
						/>
					</div>
					<div>
						<TextField
							className={classes.datetime}
							label="End date"
							type="date"
							defaultValue={endDate}
							InputLabelProps={{
								shrink: true
							}}
							onChange={e => setEndDate(e.target.value)}
						/>
						<TextField
							className={classes.datetime}
							label="End time"
							type="time"
							defaultValue={endTime}
							InputLabelProps={{
								shrink: true
							}}
							inputProps={{
								step: 300 // 5 min
							}}
							onChange={e => setEndTime(e.target.value)}
						/>
					</div>
					<div className={classes.actions}>
						<Button
							className={classes.actionButton}
							disabled={name.length === 0 || waiting}
							style={{ color: `${amber[500]}` }}
							variant="outlined"
							onClick={() => createSchedule()}
						>
							Create
						</Button>
						<Button
							className={classes.actionButton}
							variant="outlined"
							onClick={() => dispatch({ type: SCHEDULE_STATE, payload: false })}
						>
							Cancel
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
