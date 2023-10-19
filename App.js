import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View, Image } from 'react-native';
import ProfileStack from './components/profileStack';

export default function App() {
  return (

    <ProfileStack/>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  
  }

});
