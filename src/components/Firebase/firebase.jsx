
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: "AIzaSyAFWvL-DZ5pmnr-SSk5EfXFJHy3Jb3w8l8",
  authDomain: "react-firebase-authentic-61939.firebaseapp.com",
  databaseURL: "https://react-firebase-authentic-61939.firebaseio.com",
  projectId: "react-firebase-authentic-61939",
  storageBucket: "",
  messagingSenderId: "300891775569",
  appId: "1:300891775569:web:fc9eab5f823c385f"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;
    this.auth = app.auth();
    this.db = app.database();

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
    this.twitterProvider = new app.auth.TwitterAuthProvider();
  }

  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () =>
    this.auth.signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () =>
    this.auth.signInWithPopup(this.twitterProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: "http://localhost:3000"
    });



  // *** User API ***

  user = uid => this.db.ref(`/users/${uid}`);

  users = () => this.db.ref(`users`);


  // *** Message API *** 

  message = uid => this.db.ref(`/messages/${uid}`);

  messages = () => this.db.ref(`/messages`);

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) => (
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val();

            // default empty roles in DB user
            if (!dbUser.roles) {
              dbUser.roles = {}
            }

            // merge Auth and DB user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            }

            next(authUser)

          })
      } else {
        fallback();
      }
    })
  )
}


export default Firebase;