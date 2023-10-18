import React from 'react';
import MainScreen from './components/Main';
//aimport Login from './components/auth/Login';
/*
const firebaseConfig = {
    apiKey: "AIzaSyD4IOL2vqYSiGP4l8Icg_uCAmNo4mq4qU0",
    authDomain: "petitgram-b48fd.firebaseapp.com",
    projectId: "petitgram-b48fd",
    storageBucket: "petitgram-b48fd.appspot.com",
    messagingSenderId: "425299538465",
    appId: "1:425299538465:web:3356a2599e6e679b4d6960",
    measurementId: "G-RS2NF646G0"
  };
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}
export default class App extends Component {/*
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          loggedIn: true
        })
      } else {
        this.setState({
          loggedIn: false
        })
      }
    }
    )
  }

  render() {
    return (
      <>
        <MainScreen />
      </>
    );
  }

}
*/

export default function App() {
  return (
      <MainScreen />
  );
  }