  import UserProfileScreen from '../assets/screens/userProfileScreen';
  import FollowersListScreen from '../assets/screens/FollowersListScreen';
  import FollowingsListScreen from '../assets/screens/FollowingsListScreen';
  import { createStackNavigator } from '@react-navigation/stack';
  import ViewPost from "../assets/screens/ViewPost";
  import { NavigationContainer } from '@react-navigation/native';
  //import Feather from 'react-native-vector-icons/Feather';
  //import {View, TouchableOpacity, FlatList} from "react-native";
  import { useState, useEffect } from 'react';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
  import SearchUserProfileScreen from "../assets/screens/searchUserProfileScreen"
  import UserMod from "./auth/UserMod";
  import ChatBot from '../assets/screens/ChatBot';
  //import UserProfileHeader from './userProfileHeader';
  //import ProfileDrawer from './profileDrawer';


  const Stack = createStackNavigator();

  const ProfileStack = () => {

    const [userProfilePseudo, setUserProfilePseudo] = useState('');
    //const [showFlatList, setShowFlatList] = useState(false);

    const getUserInfo = async () => {
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "users"));
        //console.log("QuerySnapshot: ",querySnapshot);

        querySnapshot.forEach((doc) => {
          //console.log("Data j'arrive pas ! ", doc.data());
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
        <Stack.Navigator>
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ /* headerRight: () => (

                    <TouchableOpacity >
                        <Feather name='menu' color="black" size={25}/>
                    </TouchableOpacity > 
                ) */ headerTitle: userProfilePseudo}}>
            </Stack.Screen>
            <Stack.Screen name="FollowersListScreen" component={FollowersListScreen} options={{
              headerTitle:'List of Followers'
            }}></Stack.Screen>
            <Stack.Screen name="FollowingsListScreen" component={FollowingsListScreen} options={{
              headerTitle:'List of Followings'
            }}></Stack.Screen>
            <Stack.Screen name="SearchUserProfileScreen" component={SearchUserProfileScreen} options={{headerShown:false   }}/>
            <Stack.Screen name="ViewPost" component={ViewPost} options={{ headerTitle: 'Publications'}}/>
            <Stack.Screen name={"UserMod"} component={UserMod} options={{headerTitle: 'Modification des informations personels'}}/>
            <Stack.Screen name={"ChatBot"} component={ChatBot} options={{headerTitle: 'ChatBot'}}/>
      </Stack.Navigator>
      </NavigationContainer>

        )
  }


  export default ProfileStack