import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SearchScreen from './main/Search';
import SearchUserProfileScreen from '../assets/screens/searchUserProfileScreen';
import ViewPostSearch from '../assets/screens/viewPostSearch';
import UserProfileHeader from './userProfileHeader'

const Stack = createStackNavigator();

const SearchStack = () => {

    return(
        <Stack.Navigator>
            <Stack.Screen name='searchScreen' component={SearchScreen} options={{headerShown: false}}/>
            <Stack.Screen name='searchUserProfileScreen' component={SearchUserProfileScreen} options={{headerShown: false}}/>
            <Stack.Screen name='ViewPostSearch' component={ViewPostSearch} options={{headerTitle: "Publications"}}/>
        </Stack.Navigator>

    )

}

export default SearchStack;