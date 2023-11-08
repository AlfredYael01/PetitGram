import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import MainScreen from './components/Main';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './components/redux/store';
import { getApps, initializeApp } from 'firebase/app';
import { onAuthStateChanged, getAuth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage  from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const db = getFirestore();
  const loginStack = createStackNavigator();
  
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

  if (!loggedIn) {
    return (
      <Provider store={store}>
        <NavigationContainer>
          <loginStack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
            <loginStack.Screen name="Login" component={Login} />
            <loginStack.Screen name="Register" component={Register} />
          </loginStack.Navigator>
        </NavigationContainer>
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
