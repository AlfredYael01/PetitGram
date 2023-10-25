import { View, Text, StyleSheet } from 'react-native';
/* import UserProfileScreen from '../assets/screens/userProfileScreen';
import { createStackNavigator } from '@react-navigation/stack';
import ViewPost from "../assets/screens/ViewPost";
import { NavigationContainer } from '@react-navigation/native'; */
import Feather from 'react-native-vector-icons/Feather';
import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
//import ProfileDrawer from './profileDrawer';
import React from 'react';


const UserProfileHeader = ({navigation}) => {

    const [userProfilePseudo, setUserProfilePseudo] = useState('');
  //const [showFlatList, setShowFlatList] = useState(false);

  const getUserInfo = async () => {
      const auth = getAuth();
      const userId = auth.currentUser.uid;
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "users"));
      //console.log("QuerySnapshot: ",querySnapshot);

      querySnapshot.forEach((doc) => {
        //console.log("Data j'arrive ! ", doc.data());
        if(doc.data()._id === userId) {
      
          setUserProfilePseudo(doc.data().pseudo);        
        }
      })
    }

    useEffect(() => {
      getUserInfo();
    
    }, []);

    return(
        <View style={styles.container}>
             <Feather name='menu' color="black" size={25}/>
             <Text>{userProfilePseudo}</Text>
        </View>
    )
}


export default UserProfileHeader;


const styles = StyleSheet.create({

    container: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});


