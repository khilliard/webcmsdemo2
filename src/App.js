import React, { useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import AppBar from "@material-ui/core/AppBar"
import ToolBar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"
import MenuIcon from "@material-ui/icons/Menu"
import Container from "@material-ui/core/Container"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Filter from "@material-ui/icons/Filter"
import Schedule from "@material-ui/icons/Schedule"
import ImportantDevicesIcon from "@material-ui/icons/ImportantDevices"

import Drawer from "@material-ui/core/Drawer"
import Hidden from "@material-ui/core/Hidden"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"

import CircularProgress from "@material-ui/core/CircularProgress"
import { Route, Link, Switch } from "react-router-dom"
import Presentations from "./pages/Presentations"
import Players from "./pages/Players"
import Schedules from "./pages/Schedules"
import About from "./pages/About"

import Info from "@material-ui/icons/Info"

import "./App.css"
import useStore from "./store"
import useFirebase from "./firebase/useFirebase"
import Login from "./pages/Login"
import ProtectedRoute from "./components/routing/ProtectedRoute"
import AuthRoute from "./components/routing/AuthRoute"

import amber from "@material-ui/core/colors/amber"
import deepOrange from "@material-ui/core/colors/deepOrange"

export const StoreContext = React.createContext()

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex"
	},
	content: {
		marginTop: "75px",
		flexGrow: 1
	},
	title: {
		marginLeft: "4px"
	},
	toolbar: theme.mixins.toolbar,
	toolbarButton: {
		display: "inline-block",
		marginLeft: "auto"
	},
	signup: {
		color: "white",
		textDecoration: "none"
	},
	initialize: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		fontSize: "24px"
	},
	link: {
		textDecoration: "none"
	},
	logo: {
		marginLeft: "-10px",
		textDecoration: "none",
		textTransform: "none",
		fontSize: "16px"
	},
	drawer: {
		[theme.breakpoints.up("sm")]: {
			width: drawerWidth,
			flexShrink: 0
		}
	},
	drawerPaper: {
		width: drawerWidth
	},
	appBar: {
		background: `${deepOrange[500]}`,
		[theme.breakpoints.up("sm")]: {
			width: `calc(100% - ${drawerWidth}px)`,
			marginLeft: drawerWidth
		}
	},
	menuButton: {
		[theme.breakpoints.up("sm")]: {
			display: "none"
		}
	},
	selected: {
		color: `${amber[500]}`
	}
}))

// width of nav side drawer menu
const drawerWidth = 240

// Component that displays a waiting message while firebase SDK not initialized
const Initializing = () => {
	const classes = useStyles()
	return (
		<div className={classes.initialize} variant="h6">
			<CircularProgress size={24} style={{ color: `${deepOrange[500]}` }} />
			&nbsp;&nbsp;&nbsp;&nbsp;Connecting to Cloud Firestore, please wait...
		</div>
	)
}

function App(props) {
	console.log("App component rendered - props:", props)
	const [mobileOpen, setMobileOpen] = useState(false)
	// initialize and retrieve store: state + reducer dispatch
	const store = useStore()
	const firebaseApp = useFirebase()
	const classes = useStyles()

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	// nav side drawer markup
	const drawer = (
		<div>
			<div className={classes.toolbar} />
			<List>
				{[
					{ title: "Presentations", icon: <Filter />, to: "/" },
					{ title: "Players", icon: <ImportantDevicesIcon />, to: "players" },
					{ title: "Schedules", icon: <Schedule />, to: "schedules" },
					{ title: "About", icon: <Info />, to: "about" }
				].map(item => (
					<ListItem
						button
						key={item.title}
						component={Link}
						to={item.to}
						onClick={() => setMobileOpen(false)}
					>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText className={classes.selected} primary={item.title} />
					</ListItem>
				))}
			</List>
		</div>
	)

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar position="fixed" className={classes.appBar}>
				<ToolBar variant="dense">
					<IconButton
						edge="start"
						aria-label="menu"
						className={classes.menuButton}
						onClick={() => handleDrawerToggle()}
					>
						<MenuIcon />
					</IconButton>
					<Typography className={classes.title} variant="h6" color="inherit">
						<Link to="/" className={classes.link}>
							<Button className={classes.logo}>WebCMS</Button>
						</Link>
					</Typography>
					<div className={classes.toolbarButton}>
						{store.state.isLoggedIn ? (
							<Button
								className={classes.logo}
								color="inherit"
								onClick={() => firebaseApp.logout()}
							>
								Logout
							</Button>
						) : (
							<Link
								className={classes.link}
								to="/signup"
								underline="none"
								color="inherit"
							>
								<Button>Sign Up</Button>
							</Link>
						)}
					</div>
				</ToolBar>
			</AppBar>
			<nav className={classes.drawer} aria-label="mailbox folders">
				<Hidden smUp implementation="css">
					<Drawer
						variant="temporary"
						open={mobileOpen}
						onClose={handleDrawerToggle}
						classes={{
							paper: classes.drawerPaper
						}}
						ModalProps={{
							keepMounted: true // Better open performance on mobile.
						}}
					>
						{drawer}
					</Drawer>
				</Hidden>
				<Hidden xsDown implementation="css">
					<Drawer
						classes={{
							paper: classes.drawerPaper
						}}
						variant="permanent"
						open
					>
						{drawer}
					</Drawer>
				</Hidden>
			</nav>
			<Container className={classes.content}>
				{store.state.initialized ? (
					<StoreContext.Provider value={store}>
						<Switch>
							<ProtectedRoute
								store={store}
								exact={true}
								path="/"
								component={Presentations}
							/>
							<ProtectedRoute
								store={store}
								path="/players"
								component={Players}
							/>
							<ProtectedRoute
								store={store}
								path="/schedules"
								component={Schedules}
							/>
							<AuthRoute store={store} path="/signup">
								<Login signup={true} />
							</AuthRoute>
							<AuthRoute store={store} path="/login">
								<Login />
							</AuthRoute>
							<Route to="/about" component={About} />
						</Switch>
					</StoreContext.Provider>
				) : (
					<Initializing />
				)}
			</Container>
		</div>
	)
}

export default App
