import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import HelpScreen from '../assets/screens/helpScreen';
import ProfileStack from './profileStack';
import ThemeToggle from '../assets/screens/themeToggle';
import SignoutScreen from '../assets/screens/signoutScreen'
import { useSelector } from 'react-redux';

const Drawer = createDrawerNavigator();

const ProfileDrawer = () => {
  const theme = useSelector((state) => state.theme.currentTheme);
  return(
    <NavigationContainer independent={true}>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme === 'light' ? '#fff' : '#000', // Set Header color
          },
          headerTitleStyle: { color: theme === 'light' ? '#000' : '#fff' }, // Set Header text color
          headerTintColor: theme === 'light' ? '#000' : '#fff', // Set Header text color
        }}
      > 
        <Drawer.Screen name='Profile' component={ProfileStack} options={{headerShown: false}}/>
        <Drawer.Screen name='Help' component={HelpScreen} options={{headerTitle: "Help"}}/>
        <Drawer.Screen name='Theme' component={ThemeToggle} options={{headerTitle: "Theme"}}/>
        <Drawer.Screen name='SignOut' component={SignoutScreen}/>
      </Drawer.Navigator>
    </NavigationContainer>
  )
}
export default ProfileDrawer;