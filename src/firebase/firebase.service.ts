import firebase from "firebase";

export default class FirebaseService {

    public db: firebase.database.Database;

    constructor() {
        const config = {
            apiKey: "AIzaSyDYu_6TrEWdZuCZUWmB7KaI-6qdQa1dhFM",
            authDomain: "instalineup-d7712.firebaseapp.com",
            databaseURL: "https://instalineup-d7712.firebaseio.com",
            projectId: "instalineup-d7712",
            storageBucket: "instalineup-d7712.appspot.com",
            messagingSenderId: "14475899232"
        };
        this.db = firebase.initializeApp(config).database();
    }

}