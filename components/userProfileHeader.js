import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
import React from 'react';


const UserProfileHeader = ({route, navigation}) => {

    return(
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name='arrow-left' color={'black'} style={{marginLeft: 20}} size={30}/>
      </TouchableOpacity>
      <Text style={styles.pseudo}>{route.params.user.pseudo}</Text>
    </View>
    )
}

const styles = StyleSheet.create({

    container: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    screenHeader: {
      flex: 0.08,
      flexDirection: 'row',
      //backgroundColor: 'blue',
      alignItems: 'center'
  },

  pseudo: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: Dimensions.get('window').width * 0.05,
    marginBottom: Dimensions.get('window').height * 0.005
}

});


export default UserProfileHeader;