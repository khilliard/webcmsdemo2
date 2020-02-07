import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/storage"
import "firebase/auth"

const firebaseConfig = {
	apiKey: "AIzaSyA-C3wt3kiW9hO5EVa9ZOr2YY6Xh7d_jxg",
	authDomain: "webcms-1f3c9.firebaseapp.com",
	databaseURL: "https://webcms-1f3c9.firebaseio.com",
	projectId: "webcms-1f3c9",
	storageBucket: "webcms-1f3c9.appspot.com",
	messagingSenderId: "98346662758",
	appId: "1:98346662758:web:71fbb8ced0fd67ba9366a7",
	measurementId: "G-G4F9NKVLCQ"
}

// initialize firebase app instance
const firebaseApp = firebase.initializeApp(firebaseConfig)

// create and store references to key firebase services
firebaseApp.db = firebase.firestore()
firebaseApp.auth = firebase.auth()
firebaseApp.storage = firebase.storage()

//////////////////////////////////////////////////////////////////////
// Add various firease helper methods to be used by the client.			//
// Separate all concerns here so client need no firebase knowledge	//
//////////////////////////////////////////////////////////////////////

firebaseApp.login = async (email, password) => {
	return await firebaseApp.auth.signInWithEmailAndPassword(email, password)
}

firebaseApp.logout = async () => {
	return await firebaseApp.auth.signOut()
}

firebaseApp.signup = async (email, password) => {
	return await firebaseApp.auth.createUserWithEmailAndPassword(email, password)
}

firebaseApp.currentUser = () => firebase.auth.currentUser

////////////////////////////////////////////////////
// Upload presentation file to firebase storage 	//
// Store at 'users/${uid}/presentations' endpoint //
////////////////////////////////////////////////////
firebaseApp.uploadFile = async (filePath, file) => {
	// const user = firebaseApp.auth.currentUser
	console.log(`uploading ${file.name} to ${filePath}`)
	const storageRef = firebaseApp.storage.ref(filePath)
	return await storageRef.put(file)
}

////////////////////////////////////////////////////////
// Add document to firestore database at endpoint			//
// Document will be added at 'users/{uid}/endpoint'		//
////////////////////////////////////////////////////////
firebaseApp.addDocument = async (endpoint, doc) => {
	const user = firebaseApp.auth.currentUser
	const timestamp = firebase.firestore.FieldValue.serverTimestamp()
	doc.createdAt = timestamp
	return await firebaseApp.db
		.collection("users")
		.doc(`${user.uid}`)
		.collection(endpoint)
		.add(doc)
}

////////////////////////////////////////////////////////////
// Document modified by client, update firestore database	//
////////////////////////////////////////////////////////////
firebaseApp.updateDocument = async (doc, docData) => {
	const timestamp = firebase.firestore.FieldValue.serverTimestamp()
	docData.updatedAt = timestamp
	return await doc.ref.update(docData)
}

////////////////////////////////////////////////
// Retrieve document from firestore database	//
////////////////////////////////////////////////
firebaseApp.retrieveDocument = async docPath => {
	return await firebaseApp.db.doc(docPath).get()
}

// Query collection endpoint for matching document(s)
firebaseApp.queryDocument = async (endpoint, query) => {
	const user = firebaseApp.auth.currentUser
	return await firebaseApp.db
		.collection("users")
		.doc(`${user.uid}`)
		.collection(endpoint)
		.where(query.param1, query.op, query.param2)
		.get()
}

//////////////////////////////////////////////
// Delete document from firestore database	//
//////////////////////////////////////////////
firebaseApp.deleteDocument = async doc => {
	return await doc.ref.delete()
}

//////////////////////////////////////////////
// Delete file from in firebase storage			//
//////////////////////////////////////////////
firebaseApp.deleteFile = async filePath => {
	console.log(`deleting file from storage - path: ${filePath}`)
	const result = await firebaseApp.storage.ref(filePath).delete()
	console.log("firestore document delete await completed")
	return result
}

//
firebaseApp.queryResource = async resource => {
	console.log(`querying firestore for '${resource}' documents`)
	const endpoints = []
	const user = firebaseApp.auth.currentUser
	const ref = firebaseApp.db
		.collection("users")
		.doc(`${user.uid}`)
		.collection(resource)
	console.log("***** collection reference", ref)
	await ref.get().then(querySnapshot => {
		querySnapshot.forEach(doc => {
			// console.log(`query doc id: ${doc.id}, data:`, doc.data())
			endpoints.push(doc)
		})
	})
	return endpoints
}

export default firebaseApp
