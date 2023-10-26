import { StatusBar } from 'expo-status-bar';
import { FlatList, Dimensions, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ImageComponent from "../../components/ImageComponent";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapshot  } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';


const data = [{key: "Sign out"}];

const UserProfileScreen = ({navigation}) => {

//   const { showFlatList } = route.params; 

/*   const toggleFlatList = () => {
    navigation.setParams({ showFlatList: !showFlatList });
  }; */

  const auth = getAuth();
  const userId = auth.currentUser.uid;
    const ImagesArray = [
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
        require('./GenerationImage/whiteBackground.jpg'),
    ];
    const [images, setImages] = useState(ImagesArray);
    const [userProfileName, setUserProfileName] = useState('');
    const [userProfileDescription, setUserProfileDescription] = useState('');
    const [userProfileImage, setUserProfileImage] =  useState(null);

    const getUserInfo = async () => {
      const auth = getAuth();
      const userId = auth.currentUser.uid;
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "users"));
      //console.log("QuerySnapshot: ",querySnapshot);

      querySnapshot.forEach((doc) => {
        //console.log("Data: ", doc.data());
        if(doc.data()._id === userId) {
       
          setUserProfileName(doc.data().name);
          setUserProfileDescription(doc.data().description);
          setUserProfileImage(doc.data().photo);
          
        }
      })
    }




    const getPosts = async () => {
        const imagesArray = [];
        const auth = getAuth();
        const userId = auth.currentUser.uid;
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
      getUserInfo();
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



    const renderFlatList = () => (
        <FlatList data={data} renderItem={({item}) => <Text>{item}</Text>}/>
    )


    return(

    <View style={styles.container}>

{/* --------- Up screen-------------- */}

      <View style={styles.upScreen}>


        <View>
        </View>
        {/* -----Up top----- */}
        <View style={styles.upScreenTop}>

          <View style={styles.upScreenTopLeft}>
            <Image source={{uri: String(userProfileImage)}} style={styles.image}></Image>
            <Text style={styles.name}>{userProfileName}</Text>
          </View>

          <View style={styles.upScreenTopRight}>
       {/*      <View>{showFlatList && renderFlatList()}</View> */}
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
          <Text style={styles.description}>{userProfileDescription}</Text>
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
    backgroundColor: '#fff',  
    },

    upScreen: {
    flex: 0.4,
    //backgroundColor: 'green',
    },

    upScreenTop: {
    flexDirection: 'row',
    //backgroundColor: 'black',
    flex: 0.5
    },

    upScreenTopLeft: {
    //backgroundColor: 'purple',
    flex: 0.35,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
    },

    upScreenTopRight: {
    flex: 0.65,
    //backgroundColor: 'yellow',
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
    //backgroundColor: '#effabe',
    alignItems: 'center',
    justifyContent: 'center'
    },

    section2: {
    flex: 1/3,
    //backgroundColor: '#e6fa8c',
    alignItems: 'center',
    justifyContent: 'center'

    },
    section3: {
    flex: 1/3,
    //backgroundColor: '#d7f745',
    alignItems: 'center',
    justifyContent: 'center'

    },

    /********************  upscreen Midle     ******************************/

    upScreenMiddle: {
    flex: 0.2,
    //backgroundColor: 'gray'
    },

    name: {
    marginTop: Dimensions.get('window').height * 0.01,
    //color: 'white',
    color: 'black',
    fontWeight: 'bold'
    },

    description: {
    marginTop: Dimensions.get('window').height * 0.015,
    marginLeft: Dimensions.get('window').height * 0.025,
    //color: 'white',
    color: 'black'
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
        //backgroundColor :'pink',
        justifyContent: 'center',
        alignItems:'center'
    },

    /********************  down Midle     ******************************/

    touchableMenu:{

  padding: 10,
  //backgroundColor: 'orange',
  marginLeft: Dimensions.get('window').width * 0.6,
  marginTop: Dimensions.get('window').height * 0.035
},
    downScreen: {
    flex: 0.6,
//backgroundColor: 'red'
    }

})

export default UserProfileScreen