import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View, Image } from 'react-native';
import UserProfileScreen from './assets/screens/userProfileScreen';

export default function App() {
  return (
    <UserProfileScreen></UserProfileScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  
  }

});
