import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";


//import * as firebase from "firebase";
declare var firebase: any;

@Injectable()
export class FirebaseService {

    authCallback: any;

    constructor() {
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyCk6N39ZJkb-gM2EBTg2fSiwbvk9Lm0VUs",
            authDomain: "newfirebaseapp-2ee6f.firebaseapp.com",
            databaseURL: "https://newfirebaseapp-2ee6f.firebaseio.com",
            storageBucket: "newfirebaseapp-2ee6f.appspot.com",

        };
        firebase.initializeApp(config);

        // check for changes in auth status


    }

    onAuthStateChanged(_function) {
        return firebase.auth().onAuthStateChanged((_currentUser) => {
            if (_currentUser) {
                console.log("User " + _currentUser.uid + " is logged in with " + _currentUser.provider);
                _function(_currentUser);
            } else {
                console.log("User is logged out");
                _function(null)
            }
        })
    }

    currentUser() {
        return firebase.auth().currentUser
    }

    logout() {
        return firebase.auth().signOut()
    }

    createEmailUser(credentials) {

        return new Observable(observer => {
            return firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
                .then((authData) => {
                    console.log("User created successfully with payload-", authData);
                    observer.next(authData)
                }).catch((_error) => {
                    console.log("Login Failed!", _error);
                    observer.error(_error)
                })
        });
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

    uploadPhotoFromFile(_imageData, _progress) {


        return new Observable(observer => {
            var fileRef = firebase.storage().ref('images/sample.jpg')
            var uploadTask = fileRef.put(_imageData);

            uploadTask.on('state_changed', function (snapshot) {
                console.log('state_changed', snapshot);
                _progress && _progress(snapshot)
            }, function (error) {
                console.log(JSON.stringify(error));
                observer.error(error)
            }, function () {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                var downloadURL = uploadTask.snapshot.downloadURL;

                // Metadata now contains the metadata for file
                fileRef.getMetadata().then(function (_metadata) {

                    // save a reference to the image for listing purposes
                    var ref = firebase.database().ref('images');
                    ref.push({
                        'imageURL': downloadURL,
                        'owner': firebase.auth().currentUser.uid,
                        'when': new Date().getTime(),
                        //'meta': _metadata
                    });
                    observer.next(uploadTask)
                }).catch(function (error) {
                    // Uh-oh, an error occurred!
                    observer.error(error)
                });

            });
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
