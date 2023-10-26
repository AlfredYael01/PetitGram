import { StatusBar } from 'expo-status-bar';
import { FlatList, Dimensions, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapshot  } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { navigation } from '@react-navigation/native';



const SearchUserProfileView = (props) => {

    return(
    <View style-={styles.container}>
        <TouchableOpacity>
            <View style={styles.element}>
                <View style={styles.containerImage}>
                    <Image source={{uri: String(props.user.photo)}} height={60} width={60} style={styles.elementImage}/>
                </View>

                <View style={styles.containerText}>
                    <Text style={styles.elementPseudo}>{props.user.pseudo}</Text>
                    <Text style={styles.elementName}>{props.user.name}</Text>
                    <Text style={styles.elementDescription}>{props.user.description}</Text>
                </View>
            </View>
        </TouchableOpacity>
    </View>
    )
};



const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'purple'
    },

    element: {
        flex: 0.2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        //backgroundColor: 'yellow',
        borderWidth: 0.5,
        borderColor: 'white',
        height: Dimensions.get('window').height * 0.1
    },
    
    containerImage: {
        flex: 0.25,
        //backgroundColor: 'pink'
    },

    containerText: {
        flex: 0.65,
        //backgroundColor: '#c934eb',
        justifyContent: 'space-between'
    },

    elementImage: {
        borderRadius: 30,
        marginLeft: Dimensions.get('window').width * 0.05
    },

    elementPseudo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white'
    },

    elementName: {
        fontSize: 13,
        color: 'gray'
    },

    elementDescription: {
        fontSize: 13,
        color: 'gray',
    }

});


export default SearchUserProfileView;