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

  doLogout() {
    this.FBService.logout()
    this.activeUser = null
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
  }

  ngOnInit() {
    console.log('ngOnInit');
    if (!this.FBService.currentUser()) {
      this.displayLogin(()=>{
        this.loadData()
      })
    }
  }
  /**
   * displays the login window
   */
  displayLogin(_callback) {
    let loginPage = Modal.create(LoginPage,{cb:_callback});
    this._navController.present(loginPage);
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
