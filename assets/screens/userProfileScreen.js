import { StatusBar } from 'expo-status-bar';
import { FlatList, Dimensions, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ImageComponent from "../../components/ImageComponent";
import {initializeApp, getApps} from 'firebase/app'
import { getFirestore, collection, getDoc, QuerySnapshot,
  QueryDocumentSnapshot,
  FieldPath,
  doc, } from 'firebase/firestore';

import { getAuth } from '@react-native-firebase/auth'


const auth = getAuth();
const userId = auth.currentUser.uid;
const db = getFirestore();

const getPosts = async (userId) => {
  
  const docRef = doc(db, 'posts', userId);
  const docSnapshot = await getDoc(docRef);
  const posts = docSnapshot.data();
  console.log(posts);
  //const posts = await getDoc(collection(db, 'posts', userId))
  
};


getPosts(userId);

const UserProfileScreen = ({navigation}) => {
    const ImagesArray = [
        require('./GenerationImage/ImageArt.jpeg'),
        require('./GenerationImage/ImageAvionForet.jpeg'),
        require('./GenerationImage/ImageBanane.jpeg'),
        require('./GenerationImage/ImageBG.jpeg'),
        require('./GenerationImage/imageCat.jpeg'),
        require('./GenerationImage/ImageDe.jpeg'),
        require('./GenerationImage/ImageDog.jpeg'),
        require('./GenerationImage/ImageJoli.jpeg'),
        require('./GenerationImage/ImageRandom.jpeg'),
        require('./GenerationImage/ImageRacoon.jpeg'),
        require('./GenerationImage/ImageEchecs.jpeg'),
        require('./GenerationImage/ImageTelephone.jpeg')
    ];
    return(

    <View style={styles.container}>

      <StatusBar/>

{/* --------- Up screen-------------- */}

      <View style={styles.upScreen}>



        {/* -----Up top----- */}
        <View style={styles.upScreenTop}>

          <View style={styles.upScreenTopLeft}>
            <Image source={require('../../assets/Yo.jpg')} style={styles.image}></Image>
            <Text style={styles.name}>Luis Argüelles</Text>
          </View>

          <View style={styles.upScreenTopRight}>

            <View style={styles.section1}>
              <Text style={styles.numberSection}>4</Text>
              <Text style={styles.textSection}>Publications</Text>
            </View>

            <View style={styles.section2}>
              <Text style={styles.numberSection}>275</Text>
              <Text style={styles.textSection}>Followers</Text>
            </View>

            <View style={styles.section3}>
              <Text style={styles.numberSection}>509</Text>
              <Text style={styles.textSection}>Followed</Text>
            </View>

          </View>

        </View>



        {/* -----Up middle----- */}
        <View style={styles.upScreenMiddle}>
          <Text style={styles.description}>Un vato rifado que siempre anda en todo y que nunca se raja</Text>
        </View>

          {/* -----Up bottom ----- */}
          <View style={styles.upscreenBottom}>
              <TouchableOpacity style={{borderColor:'black', borderWidth:0.5, borderRadius : 5, height : 25, width : 125, justifyContent : 'center', alignItems : 'center'}}>
                  <Text>Edit profile</Text>
              </TouchableOpacity>
          </View>
      </View>
        {/*-----Down screen-----*/}
        <View style={styles.downScreen}>
            <FlatList
                style={{backgroundColor: 'white'}}
                numColumns={3}
                data={ImagesArray}
                renderItem={({ item }) => <ImageComponent image={item} navigation={navigation} />}
                />
        </View>
    </View>
    )

}

const styles = StyleSheet.create({

container: {
    flex: 1,
    backgroundColor: '#fff',  
    },

    upScreen: {
    flex: 0.4,
    backgroundColor: 'green',
    },

    upScreenTop: {
    flexDirection: 'row',
    backgroundColor: 'black',
    flex: 0.5
    },

    upScreenTopLeft: {
    backgroundColor: 'purple',
    flex: 0.35,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
    },

    upScreenTopRight: {
    flex: 0.65,
    backgroundColor: 'yellow',
    flexDirection: 'row'
    },

    textSection: {
    fontSize: 12
    },

    numberSection: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: Dimensions.get('window').height * 0.000001
    },

    section1: {
    flex: 1/3,
    backgroundColor: '#effabe',
    alignItems: 'center',
    justifyContent: 'center'
    },

    section2: {
    flex: 1/3,
    backgroundColor: '#e6fa8c',
    alignItems: 'center',
    justifyContent: 'center'

    },
    section3: {
    flex: 1/3,
    backgroundColor: '#d7f745',
    alignItems: 'center',
    justifyContent: 'center'

    },

    /********************  upscreen Midle     ******************************/

    upScreenMiddle: {
    flex: 0.2,
    backgroundColor: 'gray'
    },

    name: {
    marginTop: Dimensions.get('window').height * 0.01,
    color: 'white',
    //color: 'black',
    fontWeight: 'bold'
    },

    description: {
    marginTop: Dimensions.get('window').height * 0.015,
    marginLeft: Dimensions.get('window').height * 0.025,
    color: 'white',
    //color: 'black'
    },

    image: {
    width: 80,
    height: 80,
    borderRadius: 80/2,
    marginTop: Dimensions.get('window').height * 0.005
},

accountName: {
  color: 'white',
  fontWeight: 'bold',
  marginTop: Dimensions.get('window').height * 0.035
},


    /********************  upscreen Bottom     ******************************/

upscreenBottom: {
        flex:0.3,
        backgroundColor :'pink',
        justifyContent: 'center',
        alignItems:'center'
    },

    /********************  down Midle     ******************************/

    touchableMenu:{

  padding: 10,
  backgroundColor: 'orange',
  marginLeft: Dimensions.get('window').width * 0.6,
  marginTop: Dimensions.get('window').height * 0.035
},
    downScreen: {
    flex: 0.6,
backgroundColor: 'red'
    }

})

export default UserProfileScreen