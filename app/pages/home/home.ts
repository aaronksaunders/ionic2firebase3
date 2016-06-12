import {Component, OnInit, OnDestroy} from "@angular/core";
import {Modal, NavController} from 'ionic-angular';
import {FirebaseService} from '../../lib/firebaseService'
import {LoginPage} from '../login/login'

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage implements OnInit, OnDestroy {

  authInfo: any = {};
  items = [];
  activeUser: String

  constructor(private _navController: NavController, public FBService: FirebaseService) {


  }

  onPageLoaded() {
    console.log("onPageLoaded")
    if (!this.FBService.currentUser()) {
      this.displayLogin(() => {
        this.loadData()
      })
    }
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
