import { StatusBar } from 'expo-status-bar';
import { FlatList, Dimensions, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ImageComponent from "../../components/ImageComponent";
import { useRoute } from '@react-navigation/native';
import { getFirestore, collection, getDocs, onSnapshot, query as queryFirestore, where, orderBy, doc, updateDoc, setDoc} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import UserProfileHeader from '../../components/userProfileHeader';

const SearchUserProfileScreen = ({route, navigation}) => {

    const postsArray = [
        { id : 1, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 2, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 3, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 4, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 5, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 6, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 7, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 8, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 9, images : [require('./GenerationImage/whiteBackground.jpg')]},
        { id : 10, images : [require('./GenerationImage/whiteBackground.jpg')]},
      ];
    
    const {user} = route.params;
    const [posts, setPosts] = useState(postsArray);
    const [currentUser, setCurrentUser ] = useState({});
    const [buttonFollow, setButtonFollow] = useState("");
    const [nbFollowers, setNbFollowers] = useState(0);
    const [nbFollowed, setNbFollowed] = useState(0);

    const db = getFirestore();

    const getUserInfo = async () => {
      const auth = getAuth();
      const userId = auth.currentUser.uid;
      const querySnapshot = await getDocs(collection(db, "users"));

      querySnapshot.forEach((doc) => {

        if(doc.data()._id === userId) {
        console.log("Comparaison", userId, doc.data()._id)
          setCurrentUser({...doc.data(), id: doc.id});
          console.log("Doc id :", doc.id);
        }
      })
    }


    const getPosts = async () => {
        // only docs where the user id is equal to the current user id ordered by date
        const querySnapshot = await getDocs(queryFirestore(collection(db, "posts"), where("userId", "==", user._id)));
        // order by date
        const orderedPosts = querySnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .sort((a, b) => b.date - a.date);
        setPosts(orderedPosts);
    }


    const removeElement = (array, element) => {

       return array.filter((item) => (item == element));

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


      useEffect(() => {

        if(user.followers?.length > 0){

            if(user.followers.find((id) => (id == currentUser._id))){
                setButtonFollow("Unfollow");
            }
            
            else{
                setButtonFollow("Follow");
            }
        }

        else{
            setButtonFollow("Follow");
        }
        setNbFollowed(user?.followed?.length ? user.followed.length : 0);
        setNbFollowers(user?.followers?.length ? user.followers.length : 0);
      }, [currentUser])
        
      

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
                        <Text style={{fontWeight: 'bold', color:'white'}}>{posts.length}</Text>
                        <Text style={{color: 'white'}}>Publications</Text>
                    </View>

                    <View style={styles.section2}>
                        <Text style={{fontWeight: 'bold', color:'white'}}>{nbFollowers}</Text>
                        <Text style={{color: 'white'}}>Followers</Text>
                    </View>

                    <View style={styles.section3}>
                        <Text style={{fontWeight: 'bold', color:'white'}}>{nbFollowed}</Text>
                        <Text style={{color: 'white'}}>Followed</Text>
                    </View>
                </View>
            </View>


            <View style={styles.upScreenContainerBottom}>
                <Text style={{color: 'white', marginLeft: Dimensions.get('window').width * 0.05}}>{user.description}</Text>
            </View>
         
        </View>

        <View style={styles.middleScreenContainer}>
            <TouchableOpacity style={styles.followButton} onPress={ async () => {

                if(buttonFollow == "Follow"){

                    setButtonFollow("Unfollow");
    
                    const profileRef =  doc(db, "users", user.id);
                    const userRef = doc(db, "users", currentUser.id);
    
                    await updateDoc(profileRef, {
                        followers: user?.followers ? [...user.followers, currentUser._id] : [currentUser._id]
                    });

                    user.followers = user?.followers ? [...user.followers, currentUser._id] : [currentUser._id];
                    setNbFollowers(nbFollowers + 1);
    

                    await updateDoc(userRef, {
                        followed: currentUser?.followed ? [...currentUser.followed, user._id] : [user._id]
                    })

                    currentUser.followed = currentUser?.followed ? [...currentUser.followed, user._id] : [user._id];


                }

                else if(buttonFollow == "Unfollow"){

                    setButtonFollow("Follow");

                    const profileRef =  doc(db, "users", user.id);
                    const userRef = doc(db, "users", currentUser.id);
                    const newFollower = removeElement(user.followers, currentUser.id);
                    const newFollowed = removeElement(currentUser.followed, user.id);

                    await updateDoc(profileRef, {
                        followers: newFollower
                    });


                    user.followers = newFollower;
                    setNbFollowers(nbFollowers - 1);
    
                    await updateDoc(userRef, {
                        followed: newFollowed
                    });

                    currentUser.followed = newFollowed;

                }

            }}>
                    <Text style={{color: 'white'}}>{buttonFollow}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.bottomScreenContainer}>
            <FlatList
                    style={{backgroundColor: 'black'}}
                    numColumns={3}
                    data={posts}
                    renderItem={({ item }) => <ImageComponent post={item} navigation={navigation} profile={user}/>}
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
        backgroundColor: 'purple',
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
    },

    followButton: {

        borderColor:'gray', 
        backgroundColor: 'black', 
        borderWidth:0.5, 
        borderRadius : 5, 
        height : 25, 
        width : 125, 
        justifyContent : 'center', 
        alignItems : 'center'
    }


})



export default SearchUserProfileScreen;