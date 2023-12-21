import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import HelpScreen from '../assets/screens/helpScreen';
import ProfileStack from './profileStack';
import SignoutScreen from '../assets/screens/signoutScreen'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapshot} from 'firebase/firestore';

const Drawer = createDrawerNavigator();


const ProfileDrawer = () => {

    const [userProfilePseudo, setUserProfilePseudo] = useState('');

    const getUserInfo = async () => {
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "users"));
        //console.log("QuerySnapshot: ",querySnapshot);
  
        querySnapshot.forEach((doc) => {
          //console.log("Data: ", doc.data());
          if(doc.data()._id === userId) {
         
            setUserProfilePseudo(doc.data().pseudo);
            
          }
        })
      }

      getUserInfo();

    return(
        <NavigationContainer independent={true}>
            <Drawer.Navigator> 
              <Drawer.Screen name='Profile' component={ProfileStack} options={{headerShown: false}}/>
              <Drawer.Screen name='Help' component={HelpScreen} options={{headerTitle: "Help"}}/>
              <Drawer.Screen name='SignOut' component={SignoutScreen}/>
            </Drawer.Navigator>
        </NavigationContainer>
    )
}

export default ProfileDrawer;