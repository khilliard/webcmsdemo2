import React, { useState, useContext } from "react"
import Button from "@material-ui/core/Button"
import deepOrange from "@material-ui/core/colors/deepOrange"
import amber from "@material-ui/core/colors/amber"

import {
	Dialog,
	DialogTitle,
	DialogContent,
	Checkbox,
	DialogActions
} from "@material-ui/core"

import { StoreContext } from "../../App"
import { ASSIGN_STATE } from "../../store/reducers/actionTypes"
import firebaseApp from "../../firebase"

const isChecked = (data, presentation, schedule) => {
	if (schedule) {
		// check if player assigned to schedule
		return data.schedule
			? data.schedule === schedule.ref.path
				? true
				: false
			: false
	} else {
		// check if player assigned to presentation
		return data.assignedTo
			? data.assignedTo === presentation.ref.path
				? true
				: false
			: false
	}
}

export default function Assign({ presentation, schedule }) {
	// retrieve reducer global state
	const { state, dispatch } = useContext(StoreContext)

	const mapPlayers = () => {
		// create map that associates a player's presentation assignment status
		const map = state.players.map(player => {
			let data = player.data()
			let pmap = {
				player,
				name: data.name,
				id: player.id,
				// set check state true if assigned to this presentation, else set false
				checkState: isChecked(data, presentation, schedule),
				startingCheckState: isChecked(data, presentation, schedule)
			}
			return pmap
		})
		return map
	}
	const [waiting, setWaiting] = useState(false)
	const playerMap = mapPlayers()
	// checkState array stores the checked (assigned) status for each player
	// It serves as the checkbox's model used for checkbox 2-way data binding
	const [checkState, setCheckState] = useState(() =>
		playerMap.map(map => map.checkState)
	)

	console.log("inital check states:", checkState)

	const handleAssignPlayers = () => {
		setWaiting(true)
		checkState.forEach((checkedState, index) => {
			const pmap = playerMap[index]
			if (checkedState !== pmap.startingCheckState) {
				const player = pmap.player
				const data = player.data()
				console.log(
					`assignment changed for player ${data.name}, now ${
						checkedState ? "ASSIGNED" : "NOT ASSIGNED"
					} - update firestore doc`
				)
				if (schedule) {
					data.schedule = checkedState ? schedule.ref.path : null
				} else {
					data.assignedTo = checkedState ? presentation.ref.path : null
				}
				try {
					firebaseApp.updateDocument(player, data)
				} catch (error) {
					console.log("***** error, unable to update player assignment", error)
				}
			}
		})
		setWaiting(false)
		dispatch({ type: ASSIGN_STATE, payload: false })
	}

	return (
		<Dialog
			open={true}
			onClose={() => dispatch({ type: ASSIGN_STATE, payload: false })}
		>
			<DialogTitle style={{ background: `${deepOrange[500]}` }}>
				Select TV Player Assigned to {schedule ? "Schedule" : "Presentation"}
			</DialogTitle>
			<DialogContent>
				{playerMap.map((map, index) => {
					return (
						<div key={map.id}>
							<Checkbox
								checked={checkState[index]}
								onChange={() => {
									const currentState = checkState[index]
									console.log(`current check state: ${currentState}`)
									const checked = [...checkState]
									checked[index] = !currentState
									setCheckState(checked)
								}}
							/>
							{map.name}
						</div>
					)
				})}
			</DialogContent>
			<DialogActions>
				<Button
					style={{ color: `${amber[500]}` }}
					disabled={waiting}
					onClick={() => handleAssignPlayers()}
				>
					Assign
				</Button>
				&nbsp;&nbsp;
				<Button
					onClick={() => dispatch({ type: ASSIGN_STATE, payload: false })}
				>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	)
}
