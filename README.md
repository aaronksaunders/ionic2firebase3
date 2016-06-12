# ionic2firebase3
ionic2 simple login with firebase3.0

####Getting Firebase working without the typings

added this code in the `index.html` file right below the `<ion-app>` tag

```HTML
  <ion-app></ion-app>
  <script src="https://www.gstatic.com/firebasejs/3.0.2/firebase.js"></script>
  ```
  
  Then in the `firebaseService.ts`
  
  ```javascript
  declare var firebase: any;
  ```
  
  to keep the ts compiler from complaining
  
####Firebase Initialization

You do not need to add this to `index.html`, copy the information provided to you from the [Firebase Getting Started w/Web](https://firebase.google.com/docs/web/setup) to the constructor of the library

```Javascript
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
```

##Other Ionic2 Project Repos
Integrating ionic2 Google Maps Native Plugin](https://github.com/aaronksaunders/ionic2GMapNative)
