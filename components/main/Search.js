import { View, Text, StyleSheet, TextInput, StatusBar, Dimensionsd, FlatList, Dimensions } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
import * as Icon from 'react-native-feather';
import React, { useState, useEffect } from 'react';
import SearchUserProfileView from '../searchUserProfileView';

const SearchScreen = ({navigation}) => {

  const [text, setText] = useState('');
  const [users, setUsers] = useState([]);
  const [searchedUser, setSearchedUser] = useState([]);

  const getUsers = async () => {

    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const db = getFirestore();
    // only docs where the user id is equal to the current user id
    const querySnapshot = await getDocs(collection(db, "users"));

    setUsers([])
    querySnapshot.forEach((doc) => {
      if (doc.data()._id != userId) {
        //users.push(doc.data());
        
        setUsers(users => [...users, {...doc.data(), id: doc.id}]);
      }
    });

  };


  const searchUser = (input) => {

    setSearchedUser(users.filter(matchInput))

    function matchInput(user) {

      if (user.name.toLowerCase().startsWith(input) || user.pseudo.toLowerCase().startsWith(input.toLowerCase())) {
        return true;
      }

      else if (user.name.toLowerCase().includes(input) || user.pseudo.toLowerCase().includes(input.toLowerCase())) {
        return true;
      }

      else {
        return false;
      }

    };




    /*     const user = [];
          users.forEach((item) => {
            if (item.name === userName) {
              user.push(item);
            }
          });
    
          console.log("User found: ", user); */
  }


  useEffect(() => {
    getUsers();
    const db = getFirestore();
    const query = collection(db, 'users');
    const unsubscribe = onSnapshot(query, (querySnapshot) => {
      // When the database changes, re-run getPosts
      getUsers();
    });

    // Cleanup the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return (

    <View style={styles.container}>

      <View style={styles.searchContainer}>
        <TextInput placeholder='Search' placeholderTextColor={'#828282'} style={styles.searchInput} onChangeText={inputText => {
          setText(inputText);
          searchUser(inputText);
        }} />
        <Icon.Search color={'black'} width={20} height={20} style={{ position: 'absolute', left: 90, top : 29 }} />
      </View>

      <View style={styles.profilesViewContainer}>
        <FlatList data={text === "" ? users : searchedUser} renderItem={({ item }) => <SearchUserProfileView user={item} navigation={navigation}/>} keyExtractor={item => item._id} />
      </View>

    </View>
  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white'
  },

  searchContainer: {
    flex: 0.12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profilesViewContainer: {

    flex: 0.78,
    //backgroundColor: 'blue'
  },

  searchInput: {
    width: 250,
    height: 32,
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 5,
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: '#828282',
    marginTop: Dimensions.get('window').height * 0.01
  },

});

export default SearchScreen;