import React, { useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import amber from "@material-ui/core/colors/amber"
import red from "@material-ui/core/colors/red"

// import firebaseApp from "../firebase"
import { StoreContext } from "../App"
import CreatePlayerControl from "../components/players/CreatePlayerControl"
import EditPlayerControl from "../components/players/EditPlayerControl"
import Player from "../components/players/Player"
import { PLAYER_STATE } from "../store/reducers/actionTypes"

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

export default function Players(props) {
	// retrieve app state
	const { state } = useContext(StoreContext)
	const classes = useStyles()

	return (
		<>
			<div className={classes.title}>
				<Typography className={classes.inline} variant="h6">
					Media Players:
				</Typography>
				<CmdButton action={{ type: PLAYER_STATE, payload: true }}>
					Create
				</CmdButton>
			</div>
			<div className={classes.items}>
				{state.players.map(doc => (
					<Player key={doc.id} player={doc} />
				))}
			</div>
			{/* Conditionally display edit player dialog popup that allows user to edit/delete player */}
			{/* Display state controlled by reducer action (EDIT_PLAYER_STATE) triggered by click events */}
			{state.playerState ? <CreatePlayerControl /> : null}
			{state.editPlayerState ? <EditPlayerControl /> : null}
			<div>Click to edit/delete media player</div>
		</>
	)
}
