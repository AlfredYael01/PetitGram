import {createStackNavigator} from '@react-navigation/stack';
import AddScreen from './main/Add';
import AddPostDescriptionScreen from '../assets/screens/addPostDescriptionScreen';
import AddCamera from './main/AddCamera';

const Stack = createStackNavigator();

const AddStack = () => {

    return(

        <Stack.Navigator>
            <Stack.Screen name='AddScreen' component={AddScreen}/>
            <Stack.Screen name='AddCameraScreen' component={AddCamera}/>
            <Stack.Screen name='AddPostDescriptionScreen' component={AddPostDescriptionScreen}/>
        </Stack.Navigator>
    )

};


export default AddStack;