import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import MainScreen from './components/Main';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './components/redux/store';
import { getApps, initializeApp } from 'firebase/app';
import { onAuthStateChanged, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setUser } from './components/redux/userActions';

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

const email = 'test@gmail.com';
const password = 'password';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    // Create user with email and password if not exists
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        dispatch(setUser(user)); // Dispatch user data to Redux
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error);
        // ..
      });

    const subscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser(user)); // Dispatch user data to Redux
      }
    });

    return subscriber; // Unsubscribe on unmount
  }, [dispatch]);

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

export default function ReduxApp() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  
  }

});
