import React, { useState, useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import Button from "@material-ui/core/Button"
import deepOrange from "@material-ui/core/colors/deepOrange"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"
import cyan from "@material-ui/core/colors/cyan"

import firebaseApp from "../../firebase"
import { StoreContext } from "../../App"
import {
	ASSIGN_STATE,
	EDIT_SCHEDULE_STATE
} from "../../store/reducers/actionTypes"
import Assign from "../players/Assign"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
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
	confirm: {
		display: "flex",
		justifyContent: "center"
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

export default function EditScheduleControl() {
	const { state, dispatch } = useContext(StoreContext)
	const classes = useStyles()
	// retrieve schedule passed in state variable
	const schedule = state.editScheduleState
	const scheduleData = schedule.data()
	const [name, setName] = useState(scheduleData.name)
	// find presentation associated with this schedule
	const presentations = state.presentations
	const [scheduledPresentation, setScheduledPresentation] = useState(() =>
		presentations.find(
			presentation => presentation.ref.path === scheduleData.presentation
		)
	)
	const [startDate, setStartDate] = useState(scheduleData.startDate)
	const [startTime, setStartTime] = useState(scheduleData.startTime)
	const [endDate, setEndDate] = useState(scheduleData.endDate)
	const [endTime, setEndTime] = useState(scheduleData.endTime)
	const [confirm, setConfirm] = useState(false)
	const [waiting, setWaiting] = useState(false)

	console.log(
		`schedule name: ${name}, start date: ${startDate}, time: ${startTime}, end date: ${endDate}, time: ${endTime}`
	)

	// update scheduled presentation
	const handleChange = doc => {
		setScheduledPresentation(doc)
	}

	//////////////////////////////////////////////////////////////
	// Delete presentation schedule 														//
	// Will have to undo any player assigned to this schedule 	//
	//////////////////////////////////////////////////////////////
	const handleDeleteSchedule = async () => {
		setConfirm(false)
		setWaiting(true)
		const schedulePath = schedule.ref.path
		try {
			await firebaseApp.deleteDocument(schedule)
			const promises = []
			// check all players schedule assignments
			state.players.forEach(player => {
				let data = player.data()
				// check if player assigned to (soon to be) deleted schedule
				if (data.schedule === schedulePath) {
					console.log(`removing assigned schedule from player '${data.name}'`)
					// undo assignment
					data.schedule = null
					promises.push(firebaseApp.updateDocument(player, data))
				}
			})
			await Promise.all(promises)
		} catch (error) {
			console.log("detected error deleting schedule", error)
		}
		dispatch({ type: EDIT_SCHEDULE_STATE, payload: false })
	}

	const handleCreateSchedule = async () => {
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
			await firebaseApp.updateDocument(schedule, scheduleDoc)
		} catch (error) {
			console.log("deteted error creating schedule:", error)
		}
		dispatch({ type: EDIT_SCHEDULE_STATE, payload: false })
	}

	const Confirm = () => {
		return (
			<Dialog open={true} onClose={() => setConfirm(false)}>
				<DialogTitle style={{ background: `${red[500]}` }}>
					Confirm Delete
				</DialogTitle>
				<DialogContent>Delete schedule?</DialogContent>
				<DialogActions className={classes.confirm}>
					<Button onClick={() => handleDeleteSchedule()}>Yes</Button>
					&nbsp;&nbsp;
					<Button onClick={() => setConfirm(false)}>No</Button>
				</DialogActions>
			</Dialog>
		)
	}

	return (
		<div>
			<Dialog open={true}>
				<DialogTitle className={classes.title}>
					Edit Presentation Display Schedule
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
							onClick={() => handleCreateSchedule()}
						>
							Update
						</Button>
						<Button
							className={classes.actionButton}
							disabled={waiting}
							style={{ color: `${red[500]}` }}
							variant="outlined"
							onClick={() => setConfirm(true)}
						>
							Delete
						</Button>
						<Button
							className={classes.actionButton}
							disabled={name.length === 0 || waiting}
							style={{ color: `${cyan[500]}` }}
							variant="outlined"
							onClick={() => dispatch({ type: ASSIGN_STATE, payload: true })}
						>
							Assign
						</Button>
						<Button
							className={classes.actionButton}
							variant="outlined"
							onClick={() =>
								dispatch({ type: EDIT_SCHEDULE_STATE, payload: false })
							}
						>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			{confirm ? <Confirm /> : null}
			{state.assignState ? <Assign schedule={schedule} /> : null}
		</div>
	)
}
