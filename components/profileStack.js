import UserProfileScreen from '../assets/screens/userProfileScreen';
import { createStackNavigator } from '@react-navigation/stack';
import ViewPost from "../assets/screens/ViewPost";
import { NavigationContainer } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {TouchableOpacity} from "react-native";
import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapsho } from 'firebase/firestore';


const Stack = createStackNavigator()

const ProfileStack = () => {

const [userProfilePseudo, setUserProfilePseudo] = useState('');

const getUserInfo = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "users"));
    console.log("QuerySnapshot: ",querySnapshot);

    querySnapshot.forEach((doc) => {
      console.log("Data j'arrive pas ! ", doc.data());
      if(doc.data()._id === userId) {
    
        setUserProfilePseudo(doc.data().pseudo);        
      }
    })
  }

  useEffect(() => {
    getUserInfo();
  
  }, []);

    return(
    <NavigationContainer independent={true}>
        <Stack.Navigator screenOptions={{headerTitle: userProfilePseudo}}>
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ headerRight: () => (
                    <TouchableOpacity style={{padding: 10}}>
                        <Feather name='menu' color="black" size={25}/>
                    </TouchableOpacity>
                )}}/>
            <Stack.Screen name="ViewPost" component={ViewPost} />
        </Stack.Navigator>
    </NavigationContainer>

    )
}


export default ProfileStack