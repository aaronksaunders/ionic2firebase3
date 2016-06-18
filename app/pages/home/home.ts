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
  currentImage
  images = {}

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


  doImageResize(img, callback, MAX_WIDTH: number = 900, MAX_HEIGHT: number = 900) {
    var canvas = document.createElement("canvas");

    var image = new Image();

    image.onload = function () {
      console.log("Size Before: " + image.src.length + " bytes");

      var width = image.width;
      var height = image.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, width, height);

      var dataUrl = canvas.toDataURL('image/jpeg');
      // IMPORTANT: 'jpeg' NOT 'jpg'
      console.log("Size After:  " + dataUrl.length + " bytes");
      callback(dataUrl)
    }

    image.src = img;
  }

  doTakePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 640
    }).then((imageData) => {
      // imageData is a file path

      this.doImageResize(imageData, (_data) => {
        this.ngZone.run(() => {
          this.currentImage = _data
          this.images['thumb'] = _data
        })
      }, 640)

      window.resolveLocalFileSystemURL(imageData, (fileEntry) => {

        fileEntry.file((resFile) => {

          var reader = new FileReader();
          reader.onloadend = (evt) => {

            var imgBlob: any = new Blob([evt.target.result], { type: 'image/jpeg' });
            imgBlob.name = 'sample.jpg';

            this.images['blob'] = imgBlob;

            this.FBService.uploadPhotoFromFile(this.images, this._pictureUploadProgress)
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
