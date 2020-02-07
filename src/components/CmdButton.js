import React, { useContext } from "react"
import Button from "@material-ui/core/Button"
import amber from "@material-ui/core/colors/amber"

import { StoreContext } from "../App"

export default function CmdButton(props) {
	console.log("CmdButton - props:", props)
	const { children, action, ...others } = props
	const { dispatch } = useContext(StoreContext)

	return (
		<Button
			style={{ color: `${amber[500]}` }}
			variant="outlined"
			color="inherit"
			onClick={() => dispatch(action)}
			{...others}
		>
			<span style={{ color: "white" }}>{children}</span>
		</Button>
	)
}
