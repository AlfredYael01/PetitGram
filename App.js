import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MainScreen from './components/Main';
import { getApps, initializeApp } from 'firebase/app';
import { onEstateChange, signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD4IOL2vqYSiGP4l8Icg_uCAmNo4mq4qU0",
    authDomain: "petitgram-b48fd.firebaseapp.com",
    projectId: "petitgram-b48fd",
    storageBucket: "petitgram-b48fd.appspot.com",
    messagingSenderId: "425299538465",
    appId: "1:425299538465:web:3356a2599e6e679b4d6960",
    measurementId: "G-RS2NF646G0"
};
// Initialize Firebase
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

function App() {
  // Set an initializing state whilst Firebase connects
  const email = 'test@gmail.com';
  const password = 'password';
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  // create user with email and password if not exists
  function signin () {
    signInWithEmailAndPassword(getAuth(), email, password)
      .then((userCredential) => {
        // Signed in
        setUser(userCredential.user);
        console.log(user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error);
        // ..
      });
  }

  useEffect(() => {
    createUserWithEmailAndPassword(getAuth(), email, password).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      // ..
    });
    signin();
    const subscriber = onAuthStateChanged();
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;
  console.log(user);
  if (!user) {
    return (
      <View>
        <Text>Login</Text>
      </View>
    );
  }

  return (
    <MainScreen />
  );

}

export default App;
