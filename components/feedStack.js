import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import FeedScreen from './main/Feed';
import SearchUserProfileScreen from '../assets/screens/searchUserProfileScreen';
import ViewPost from '../assets/screens/ViewPost';

const Stack = createStackNavigator();

const FeedStack = () => {

    return(
        <Stack.Navigator>
            <Stack.Screen name='feedScreen' component={FeedScreen} options={{headerShown: false}}/>
            <Stack.Screen name='searchUserProfileScreen' component={SearchUserProfileScreen} options={{headerShown: false}}/>
            <Stack.Screen name='ViewPost' component={ViewPost} options={{headerTitle: 'Publications'}}/>
        </Stack.Navigator>

    )

}

export default FeedStack;