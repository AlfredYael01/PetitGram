import UserProfileScreen from '../assets/screens/userProfileScreen';
import { createStackNavigator } from '@react-navigation/stack';
import ViewPost from "../assets/screens/ViewPost";
import { NavigationContainer } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {TouchableOpacity} from "react-native";


const Stack = createStackNavigator()

const ProfileStack = () => {

    return(
    <NavigationContainer independent={true}>
        <Stack.Navigator>
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{headerTitle: 'el_luis_arguelles', headerRight: () => (
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