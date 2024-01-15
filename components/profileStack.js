  import UserProfileScreen from '../assets/screens/userProfileScreen';
  import FollowersListScreen from '../assets/screens/FollowersListScreen';
  import FollowingsListScreen from '../assets/screens/FollowingsListScreen';
  import { createStackNavigator } from '@react-navigation/stack';
  import ViewPost from "../assets/screens/ViewPost";
  import { NavigationContainer } from '@react-navigation/native';
  import SearchUserProfileScreen from "../assets/screens/searchUserProfileScreen"
  import UserMod from "./auth/UserMod";
  import { useSelector } from 'react-redux';


  const Stack = createStackNavigator();

  const ProfileStack = () => {
    const userProfilePseudo = useSelector( ((state) => state.user.currentUser?.pseudo) ? ((state) => state.user.currentUser.pseudo) : "User Profile" )
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
            <Stack.Screen name={"UserMod"} component={UserMod} options={{headerTitle: 'Modification des informations personels'}}></Stack.Screen>
      </Stack.Navigator>
      </NavigationContainer>

        )
  }


  export default ProfileStack