import React, { useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import FormControl from "@material-ui/core/FormControl"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import Container from "@material-ui/core/Container"
import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"

import amber from "@material-ui/core/colors/amber"

import firebaseApp from "../firebase"

const useStyles = makeStyles(theme => ({
	header: {
		color: `${amber[500]}`
	},
	actions: {
		marginTop: "16px"
	},
	root: {
		flexGrow: 1
	},
	menuButton: {
		marginRight: theme.spacing(2)
	},
	button: {
		marginRight: "10px"
	},
	title: {
		flexGrow: 1
	},
	message: {
		height: "18px",
		color: "white",
		marginTop: "8px"
	},
	error: {
		height: "18px",
		color: "red",
		marginTop: "8px"
	},
	submit: {
		color: "white",
		marginRight: "10px"
	}
}))

export default function Login(props) {
	const { signup = false } = props
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirm, setConfirm] = useState("")
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState("")
	const [error, setError] = useState("")
	const classes = useStyles()

	const loginUser = async e => {
		e.preventDefault()
		if (password.length < 6) {
			setError("The password must be at least 6 characters")
			return
		}
		if (signup && password !== confirm) {
			setError("The confirm password does not match")
			return
		}
		setError("")
		setLoading(true)
		try {
			if (signup) {
				setMessage("Creating CMS account, please wait...")
				await firebaseApp.signup(email, password)
			} else {
				setMessage("Logging into CMS, please wait...")
				await firebaseApp.login(email, password)
			}
		} catch (e) {
			console.log("***** detected login error:", e)
			setError("Email or password incorrect, please try again")
			setMessage("")
			setLoading(false)
			setEmail("")
			setPassword("")
			setConfirm("")
		}
	}

	return (
		<Container maxWidth="sm">
			<Card>
				<CardHeader
					className={classes.header}
					title={signup ? "CMS Signup" : "Login to CMS"}
				/>
				<CardContent>
					<form onSubmit={loginUser}>
						<div>
							<FormControl fullWidth>
								<TextField
									InputLabelProps={{ required: false }}
									type="email"
									label="Email"
									required
									value={email}
									onChange={e => setEmail(e.target.value)}
								/>
							</FormControl>
						</div>
						<div>
							<FormControl fullWidth>
								<TextField
									InputLabelProps={{ required: false }}
									type="password"
									label="Password"
									required
									value={password}
									onChange={e => setPassword(e.target.value)}
								/>
							</FormControl>
						</div>
						{signup ? (
							<div>
								<FormControl fullWidth>
									<TextField
										InputLabelProps={{ required: false }}
										type="password"
										label="Confirm"
										required
										value={confirm}
										onChange={e => setConfirm(e.target.value)}
									/>
								</FormControl>
							</div>
						) : null}
						<div className={classes.actions}>
							<Button
								className={classes.submit}
								disabled={loading}
								type="submit"
								variant="outlined"
								value="login"
							>
								{signup ? "Sign Up" : "Login"}
							</Button>
						</div>
						<div className={classes.message}>{message || error}</div>
					</form>
				</CardContent>
			</Card>
		</Container>
	)
}
