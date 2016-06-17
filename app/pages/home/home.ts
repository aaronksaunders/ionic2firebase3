import {Component, OnInit, OnDestroy} from "@angular/core";
import {Modal, NavController} from 'ionic-angular';
import {FirebaseService} from '../../lib/firebaseService'
import {LoginPage} from '../login/login'
import {NgZone} from '@angular/core';

// plugin 
import {Camera, File, Toast} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage implements OnInit, OnDestroy {

  authInfo: any = {};
  items = [];
  activeUser: String
  progress: number = 0

  constructor(private _navController: NavController,
    public FBService: FirebaseService,
    private ngZone: NgZone) {
  }

  onAuthAction(_user) {
    console.log(_user)
  }

  onPageLoaded() {
    console.log("onPageLoaded")

    var unSubscribe = this.FBService.onAuthStateChanged((_currentUser) => {

      unSubscribe()

      if (_currentUser) {
        console.log("User " + _currentUser.uid + " is logged in with " + _currentUser.email);
        this.authInfo = _currentUser
        this.loadData()
      } else {
        console.log("User is logged out");
        this.displayLogin(() => {
          this.authInfo = this.FBService.currentUser()
          this.loadData()
        })
      }
    })
  }

  _pictureUploadProgress = (_progress): void => {
    this.ngZone.run(() => {
      console.log("_pictureUploadProgress", _progress)
      this.progress = Math.round((_progress.bytesTransferred / _progress.totalBytes) * 100);
      if (this.progress === 100) {
        setTimeout(() => { this.progress = 0 }, 500);
      }
    })
  }


  doTakePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 640
    }).then((imageData) => {
      // imageData is a file path

      window.resolveLocalFileSystemURL(imageData, (fileEntry) => {

        fileEntry.file((resFile) => {

          var reader = new FileReader();
          reader.onloadend = (evt) => {

            var imgBlob: any = new Blob([evt.target.result], { type: 'image/jpeg' });
            imgBlob.name = 'sample.jpg';

            this.FBService.uploadPhotoFromFile(imgBlob, this._pictureUploadProgress)
              .subscribe((data) => {
                console.log(data)

                Toast.show("File Uploaded Successfully", "1000", "center").subscribe(
                  toast => {
                    console.log(toast);
                  }
                );
              },
              (error) => {
                console.log(error)
                Toast.show("File Error" + error, "5000", "center").subscribe(
                  toast => {
                    console.log(toast);
                  }
                );
              },
              () => { });
          };
          reader.onerror = (e) => {
            console.log("Failed file read: " + e.toString());
          };
          reader.readAsArrayBuffer(resFile);

        });
      });

    }, (err) => {
      console.log(err);
    });
  }

  doLogout() {
    this.FBService.logout().then(() => {
      // Sign-out successful.
      this.activeUser = null
      this._navController.push(LoginPage)
    }, function (error) {
      // An error happened.
      alert(error)
    });

  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
  }

  ngOnInit() {
    console.log('ngOnInit');

  }
  /**
   * displays the login window
   */
  displayLogin(_callback) {
    this._navController.push(LoginPage, { cb: _callback });
  }

  addItem() {

  }
  loadData() {
    console.log('loadData');

    this.FBService.getDataObs()
      .subscribe((data: Array<any>) => {
        console.log(data)
        this.items = data
      },
      (error) => {
        console.log(error)
      });
  }

  /*
    pushPage(){
      this._navController.push(SomeImportedPage, { userId: "12345"});
    }
  */
}
