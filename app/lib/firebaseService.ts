import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";


//import * as firebase from "firebase";
declare var firebase: any;

@Injectable()
export class FirebaseService {

    constructor() {
        // Initialize Firebase
        var config = {
            apiKey: "your-key",
            authDomain: "clearlyinnovative-firebasestarterapp.firebaseapp.com",
            databaseURL: "https://clearlyinnovative-firebasestarterapp.firebaseio.com",
            storageBucket: "clearlyinnovative-firebasestar.appspot.com",
        };
        firebase.initializeApp(config);

        // check for changes in auth status

        firebase.auth().onAuthStateChanged((_currentUser) => {
            if (_currentUser) {
                console.log("User " + _currentUser.uid + " is logged in with " + _currentUser.provider);
            } else {
                console.log("User is logged out");
            }
        })
    }

    currentUser() {
        return firebase.auth.currentUser
    }

    logout() {
        return firebase.auth().signOut()
    }

    login(credentials) {
        var that = this

        return new Observable(observer => {
            return firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
                .then(function (authData) {
                    console.log("Authenticated successfully with payload-", authData);
                    observer.next(authData)
                }).catch(function (_error) {
                    console.log("Login Failed!", _error);
                    observer.error(_error)
                })
        });
    }

    getDataObs() {
        var ref = firebase.database().ref('textItems')
        var that = this

        return new Observable(observer => {
            ref.on('value',
                (snapshot) => {
                    var arr = []

                    snapshot.forEach(function (childSnapshot) {
                        var data = childSnapshot.val()
                        data['id'] = childSnapshot.key
                        arr.push(data);
                    });
                    observer.next(arr)
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }
}
