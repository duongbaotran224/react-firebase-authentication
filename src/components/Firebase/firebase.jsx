
import app from 'firebase/app';

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
  }
}
export default Firebase;