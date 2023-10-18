import { createStackNavigator } from '@react-navigation/stack';
import ViewPost from "../assets/screens/ViewPost";
import UserProfileScreen from "../assets/screens/userProfileScreen";
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function ProfileStack() {
    return (

        <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <Stack.Screen name="ViewPost" component={ViewPost} />
        </Stack.Navigator>
        </NavigationContainer>
    );
}
