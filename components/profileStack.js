import UserProfileScreen from '../assets/screens/userProfileScreen';
import { createStackNavigator } from '@react-navigation/stack';
import ViewPost from "../assets/screens/ViewPost";
import { NavigationContainer } from '@react-navigation/native';


const Stack = createStackNavigator()

const ProfileStack = () => {

    return(
    <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <Stack.Screen name="ViewPost" component={ViewPost} />
        </Stack.Navigator>
    </NavigationContainer>

    )
}


export default ProfileStack