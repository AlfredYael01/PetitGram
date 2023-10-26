import { StatusBar } from 'expo-status-bar';
import { FlatList, Dimensions, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ImageComponent from "../../components/ImageComponent";
import { useRoute } from '@react-navigation/native';
import { getFirestore, collection, getDocs, onSnapshot  } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const SearchUserProfileScreen = ({route, navigation}) => {

    const {user} = route.params;

    const [images, setImages] = useState([]);

    const getPosts = async () => {

        const imagesArray = [];

        const userId = user._id;
        const db = getFirestore();
        // only docs where the user id is equal to the current user id
        const querySnapshot = await getDocs(collection(db, "posts"));

      const posts = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().userId === userId) {
                posts.push(doc.data());
            }
        });

      posts.forEach((item) => {
        if (item.images) {
          imagesArray.push(...item.images);
        }
      });
        setImages(imagesArray);   
        console.log(imagesArray);
       
    }

    // call getPosts when the component mounts
    useEffect(() => {
      const db = getFirestore();
      const query = collection(db, 'posts');
      const unsubscribe = onSnapshot(query, (querySnapshot) => {
        // When the database changes, re-run getPosts
        getPosts();
      });
  
      // Cleanup the listener when the component unmounts
      return () => {
        unsubscribe();
      };
    }, []);

    return(

    <View style={styles.container}>

        <View style={styles.screenHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name='arrow-left' color={'white'} style={{marginLeft: 20}} size={30}/>
            </TouchableOpacity>
            <Text style={styles.pseudo}>{user.pseudo}</Text>
        </View>

        <View style={styles.upScreenContainer}>

            <View style={styles.upScreenContainerUp}>
                <View style={styles.upScreenContainerLeft}>
                    <Image source={{uri: String(user.photo)}} style={styles.image}/>
                    <Text style={styles.name}>{user.name}</Text>
                </View>

                <View style={styles.upScreenContainerRight}>
                    <View style={styles.section1}>
                        <Text style={{fontWeight: 'bold', color:'white'}}>6</Text>
                        <Text style={{color: 'white'}}>Publications</Text>
                    </View>

                    <View style={styles.section2}>
                        <Text style={{fontWeight: 'bold', color:'white'}}>234</Text>
                        <Text style={{color: 'white'}}>Followers</Text>
                    </View>

                    <View style={styles.section3}>
                        <Text style={{fontWeight: 'bold', color:'white'}}>761</Text>
                        <Text style={{color: 'white'}}>Followed</Text>
                    </View>
                </View>
            </View>


            <View style={styles.upScreenContainerBottom}>
                <Text style={{color: 'white', left: Dimensions.get('window').width * 0.04}}>{user.description}</Text>
            </View>
         
        </View>

        <View style={styles.middleScreenContainer}>
            <TouchableOpacity style={{borderColor:'gray', backgroundColor: 'black', borderWidth:0.5, borderRadius : 5, height : 25, width : 125, justifyContent : 'center', alignItems : 'center'}}>
                    <Text style={{color: 'white'}}>Follow</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.bottomScreenContainer}>
            <FlatList
                    style={{backgroundColor: 'black'}}
                    numColumns={3}
                    data={images}
                    renderItem={({ item }) => <ImageComponent image={item} navigation={navigation} />}
                    />
        </View>
        
    </View>

    )
}


const styles = StyleSheet.create({
    
    container: {
        flex: 1,
        backgroundColor: 'black'
    },

    screenHeader: {
        flex: 0.08,
        flexDirection: 'row',
        //backgroundColor: 'blue',
        alignItems: 'center'
    },

    upScreenContainer: {
        flex: 0.25,
        flexDirection: 'column',
        //backgroundColor: 'blue'
    },

    upScreenContainerUp:{
        flex: 2,
        flexDirection: 'row'
    },

    upScreenContainerLeft: {
        flex: 0.3,
        //backgroundColor: '#3489eb',
        alignItems: 'center',
    },

    upScreenContainerRight: {
        flex: 0.7,
        flexDirection: 'row',
        //backgroundColor: '#5f34eb'
    },

    section1: {
        flex: 1/3,
        //backgroundColor: '#7cf8fc',
        alignItems: 'center',
        justifyContent: 'center'
    },
    section2: {
        flex: 1/3,
        //backgroundColor: '#4df9ff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    section3: {
        flex: 1/3,
        //backgroundColor: '#07eff7',
        alignItems: 'center',
        justifyContent: 'center'
    },

    upScreenContainerBottom: {
        flex: 0.5,
        //backgroundColor: 'orange'
    },

    middleScreenContainer: {
        flex: 0.1,
        //backgroundColor: 'yellow',
        alignItems: 'center',
        justifyContent: 'center'
    },

    bottomScreenContainer: {

        flex: 0.57,
        backgroundColor: 'purple'
    },

    pseudo: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        marginLeft: Dimensions.get('window').width * 0.05,
        marginBottom: Dimensions.get('window').height * 0.005
    },

    name: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: Dimensions.get('window').height * 0.01
    },

    description: {
        color: 'white'
    },

    image: {

        width: 80,
        height: 80,
        borderRadius: 40,
        marginTop: Dimensions.get('window').height * 0.02
    }


})



export default SearchUserProfileScreen;