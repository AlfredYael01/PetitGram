import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from './main/Search';
import SearchUserProfileScreen from '../assets/screens/searchUserProfileScreen';
import ViewPost from '../assets/screens/ViewPost';

const Stack = createStackNavigator();

const SearchStack = () => {

    return(
        <Stack.Navigator>
            <Stack.Screen name='searchScreen' component={SearchScreen} options={{headerShown: false}}/>
            <Stack.Screen name='searchUserProfileScreen' component={SearchUserProfileScreen} options={{headerShown: false}}/>
            <Stack.Screen name='ViewPost' component={ViewPost} options={{headerTitle: "Publications"}}/>
        </Stack.Navigator>

    )

}

export default SearchStack;