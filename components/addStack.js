import {createStackNavigator} from '@react-navigation/stack';
import AddScreen from './main/Add';
import AddPostDescriptionScreen from '../assets/screens/addPostDescriptionScreen';
import AddCamera from './main/AddCamera';

const Stack = createStackNavigator();

const AddStack = () => {

    return(

        <Stack.Navigator initialRouteName='Add Post'>
            <Stack.Screen name='Add Post' component={AddScreen}
            options={{
                headerShown: false
            }}/>
            <Stack.Screen name='Camera' component={AddCamera}/>
            <Stack.Screen name='Add Description' component={AddPostDescriptionScreen}/>

        </Stack.Navigator>
    )

};


export default AddStack;