import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar } from 'react-native';
import MainScreen from './components/Main';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './components/redux/store';
import { getApps, initializeApp } from 'firebase/app';
import { onAuthStateChanged, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setUser } from './components/redux/userActions';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage  from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import Login from './components/auth/Login';
import { react } from '@babel/types';

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
  const app = initializeApp(firebaseConfig);
  initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage ),
  });
}

const email = 'anis@gmail.com';
const password = 'password';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const db = getFirestore();
  
  const [loggedIn, setLoggedIn] = useState(false)
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      if (!user) {
        setLoggedIn(false);
      }
      else {
        setLoggedIn(true);
      }
    })
  }, [])

  const addUser = async (user) => {
    const docRef = await addDoc(collection(db, "users"), {
      _id: user.uid,
      pseudo: "anis_SCRUM_master",
      name : "Anis",
      photo: "https://media.licdn.com/dms/image/D4D03AQHW4UzCUVe6iw/profile-displayphoto-shrink_800_800/0/1675713876361?e=1703721600&v=beta&t=HJrVFRSni-x4l404mfRTmrvYxF5ZIoSu1aQzPOzcccI",
      email: "anis@gmail.com",
      description : "L'agile c'est ma vie",
    });
    console.log("Document written with ID: ", docRef.id);
  }



  /* useEffect(() => {
    // Create user with email and password if not exists
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        ////add to firestore
        //addUser(user);
        
        console.log(getFirestore());
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
  }, [dispatch]); */


  /* useEffect(() => {
    // Create user with email and password if not exists
    const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        dispatch(setUser(serializableUser)); // Dispatch user data to Redux
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
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        dispatch(setUser(serializableUser)); // Dispatch user data to Redux
      }
    });

    return subscriber; // Unsubscribe on unmount
  }, [dispatch]); */


  /* useEffect(() => {
    // Create user with email and password if not exists
    const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        dispatch(setUser(serializableUser)); // Dispatch user data to Redux
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
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        dispatch(setUser(serializableUser)); // Dispatch user data to Redux
      }
    });

    return subscriber; // Unsubscribe on unmount
  }, [dispatch]); */

  if (!loggedIn) {
    return (
      <Provider store={store}>
       <Login></Login>

      </Provider>
 
    );
  }

  return (
    <MainScreen />
  );
}

export default function ReduxApp() {
  return (
    <Provider store={store}>
      <View>
        <StatusBar barStyle={'light-content'}/>
      </View>
      <App />
    </Provider>
  );
}
