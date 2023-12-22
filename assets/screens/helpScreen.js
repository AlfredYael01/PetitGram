import {View, Text, StyleSheet, Dimensions, TextInput, KeyboardAvoidingView, Platform, ScrollView,Alert} from 'react-native'
import React, {useState, useEffect} from 'react'
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc} from 'firebase/firestore';
import { getAuth, deleteUser, signInWithEmailAndPassword} from 'firebase/auth';
import { TouchableOpacity } from 'react-native-gesture-handler'
import Feather from 'react-native-vector-icons/Feather';
import { getStorage, deleteObject, ref} from 'firebase/storage';
import Dialog from "react-native-dialog";

const HelpScreen = () => {

    //const userId = getAuth().currentUser.uid;
    //const db = getFirestore();
    const [messageInfo, setMessageInfo] = useState({userId: '', firstName: '', lastName: '', email: '', message: ''});
    const [contactToggle, setContactToggle] = useState(false);
    const [accountDeletiontoggle, setAccountDeletionToggle] = useState(false);
    const [postsId, setPostsId] = useState([]);
    const infoSupressionDeCompte = "Deleting your account involves the complete elimination of all your data (posts and personal information) generated since the creation of your accout. This action is irreversible."
    const [dialogVisible, setDialogVisible] = useState(false);
    const [profile, setProfile] = useState();
    const [inputPassoword, setInputPassword] = useState("");
    const defaultPhoto = 'https://firebasestorage.googleapis.com/v0/b/petitgram-b48fd.appspot.com/o/Profile%2FuserImage.png?alt=media&token=29660ffe-caba-4fe6-b028-09af3f446b74&_gl=1*i459ow*_ga*NDMzMjcyMjA3LjE2OTU4ODMxMjk.*_ga_CW55HF8NVT*MTY5OTM0NzExOC4xOS4xLjE2OTkzNDcxNzIuNi4wLjA';


    const getUserId = async () => {
        const auth = getAuth();
        return  auth.currentUser.uid;
    }

    const updateFirstName = (firstName) => {
        setMessageInfo({...messageInfo, firstName: firstName})
    }

    const updateLastName = (lastName) => {
        setMessageInfo({...messageInfo, lastName: lastName})
    }

    const updateEmail = (email) => {
        setMessageInfo({...messageInfo, email: email})
    }

    const updateMessage = (message) => {
        setMessageInfo({...messageInfo, message: message})
    }


    const getUserInfo = async (userId) => {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "users"));
        //console.log("QuerySnapshot: ",querySnapshot);
  
        querySnapshot.forEach((doc) => {
          if(doc.data()._id === userId) {
            setProfile(doc.data());
          }
        })
      }

    const createMessage = async () => {

        const db = getFirestore();
        const docRef = await addDoc(collection(db, "messages"), {
            userId: messageInfo.userId,
            firstName: messageInfo.firstName,
            lastName: messageInfo.lastName,
            email: messageInfo.email,
            message: messageInfo.message
          });

          setMessageInfo({...messageInfo, _id: '', firstName: '', lastName: '', email: '', message: ''})
          console.log("Document written with ID: ", docRef.id);
    }


    const deleteAuth = async () => {


        const auth = getAuth();
        //const user = auth.currentUser;
    

// Code for signing in before deleting auth

        signInWithEmailAndPassword(auth, profile.email, inputPassoword)
            .then((userCredential) => {
            // User re-authenticated
            const user = userCredential.user;

                deleteUser(user).then(() => {
                    console.log("User deleted")
                }).catch((error) => {
                    console.log("Error deleting user: ", error);
                })
            })
            .catch((error) => {
            // An error occurred
            console.log('Error re-authenticating user:', error);
            });

    }


    const deleteAccount = async () => {

        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const querySnapshot = await getDocs(query(collection(db, "users"), where("_id", "==", userId)));

        await deleteDoc(querySnapshot.docs[0].ref).then(() => {

            console.log("User deleted")

            deleteComments();
            deletePostsAndLikes();
            deleteAuth();


        }).catch((error) => {   
            console.log("Error deleting user: ", error);
        })
    }


    const deletePostsAndLikes = async () => {
        const userId = getAuth().currentUser.uid;
        const db = getFirestore();
        const storage = getStorage();
        const querySnapshot = await getDocs(collection(db, "posts"));
        setPostsId(querySnapshot.docs.map(doc => doc.id));
        //setPosts(querySnapshot.docs.map(doc => doc.data()));

        querySnapshot.forEach((doc) => {

            //delete likes made by the user. The likes are stocked on the likes field of the post

            const imagesLinks = doc.data().images;

            for(const link of imagesLinks){

                const imageRef = ref(storage, link);

                if(imageRef == undefined){
                    continue;
                }

                if(link == defaultPhoto){
                    continue;
                }
                
                deleteObject(imageRef).then(() => {
                    console.log("Image deleted")
                }).catch((error) => {
                    console.log("Error deleting image: ", error);
                })
            }

            if(doc.data().likes.includes(userId)){
                const index = doc.data().likes.indexOf(userId);
                doc.data().likes.splice(index, 1);
                doc.ref.update({likes: doc.data().likes});
                console.log("Likes deleted")
            }

            
            if(doc.data().userId == userId){
                
                deleteDoc(doc.ref).then(() => {      
                    console.log("Post deleted")
                }).catch((error) => {
                    console.log("Error deleting post: ", error);
                })
            }
        })    
    }

    const deleteComments = async () => {

        const userId = getAuth().currentUser.uid;
        const db = getFirestore();

        for (const postId of postsId) {

            const querySnapshotComments = await getDocs(collection(db, "posts", postId, "comments"));

            querySnapshotComments.forEach((doc) => {

                if(doc.data().userId == userId){

                    //delete comments made by the user
                    deleteDoc(doc.ref).then(() => {      
                        console.log("Comment deleted")
                    }).catch((error) => {
                        console.log("Error deleting comment: ", error);
                    })
                }
            })
        }
    }

    const showAlert = () => {
        Alert.alert(
            "Are you sure you want to delete your account?",
            "This action is irreversible.",
            [
                {
                    text: "Yes, I'm sure",
                    onPress: () => {
                        //deleteComments();
                        //deletePostsAndLikes();
                        deleteAccount();
                    },
                    style: "destructive"
                },

                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel pressed"),
                    style: "cancel"
                }
            ]
        )
    
    }

    const dialog = () => {

        return (
            <View>
                <Dialog.Container visible={dialogVisible}>
                    <Dialog.Title>Are you sure you want to delete your account?, this action is irreversible</Dialog.Title>
                    <Dialog.Description>
                        If you want to delete your account, please enter your password
                    </Dialog.Description>
                    <Dialog.Input placeholder='Password' secureTextEntry={true} onChangeText={(text) => setInputPassword(text)}/>
                    <Dialog.Button label="Delete account" onPress={() => setDialogVisible(false)}/>
                </Dialog.Container>
            </View>
 
        )
    }




    useEffect( async () => {
        const userId = await getUserId();
        setMessageInfo({...messageInfo, userId: userId})
        getUserInfo(userId);
    }, [])


    return(

    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView>

                <View style={styles.toggleBox}>
                    <TouchableOpacity style={styles.toggle} onPress={() => setContactToggle(!contactToggle)}>
                        <Text style={styles.toggleText}>Contact</Text>
                        <Feather name={contactToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                    </TouchableOpacity>

                    {contactToggle &&
                    <View style={styles.contact}>
                        <Text style={styles.text}>Send us an email:</Text>
                        <TextInput style={styles.infoInput} placeholder='First name' value={messageInfo.firstName} onChangeText={updateFirstName}/>
                        <TextInput style={styles.infoInput} placeholder='Last name' value={messageInfo.lastName} onChangeText={updateLastName}/>
                        <TextInput style={styles.infoInput} placeholder='email' value={messageInfo.email} onChangeText={updateEmail}/>
                        <TextInput style={styles.inputMessage} placeholder='Message' value={messageInfo.message} multiline numberOfLines={2} onChangeText={updateMessage}/>
    
                        <TouchableOpacity style={styles.sendButton} onPress={createMessage}>
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View> 
                    }
                </View>

                <View style={styles.toggleBox}>
                    <TouchableOpacity style={styles.toggle} onPress={() => setAccountDeletionToggle(!accountDeletiontoggle)}>
                        <Text style={styles.toggleText}>Account deletion</Text>
                        <Feather name={accountDeletiontoggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                    </TouchableOpacity>

                    {accountDeletiontoggle && 
                        <View>
                            <Text style={styles.accountDeletionMessage}>{infoSupressionDeCompte}</Text>
                            <TouchableOpacity style={styles.deleteAccountButton} onPress={() => setDialogVisible(!dialogVisible)}>
                                <Text style={styles.deleteAccountButtonText}>Delete account</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>

                <View>
                    <Dialog.Container visible={dialogVisible}>
                        <Dialog.Title>Are you sure you want to delete your account?, this action is irreversible</Dialog.Title>
                        <Dialog.Description>
                            If you want to delete your account, please enter your password
                        </Dialog.Description>
                        <Dialog.Input placeholder='Password' secureTextEntry={true} onChangeText={(text) => setInputPassword(text)}/>
                        <Dialog.Button label="Cancel" onPress={() => {setDialogVisible(false)}}/>
                        <Dialog.Button label="Delete account" onPress={() => {
                            
                            setDialogVisible(false);
                            deleteAccount();
                            
                            }}/>
                    </Dialog.Container>
                </View>

        </ScrollView>
       </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({

    container:{
        flex: 1,
        backgroundColor: 'white',
    },

    contact: {
        marginLeft: Dimensions.get('window').width * 0.03,
        //backgroundColor: 'blue'
    },

    toggleBox: {
        //backgroundColor: 'red',

    },

    text: {
        fontSize: 20,
        marginLeft: Dimensions.get('window').width * 0.05,  
        marginVertical: Dimensions.get('window').height * 0.025
    },

    infoInput: {
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 8,
        width: Dimensions.get('window').width * 0.75,
        height: Dimensions.get('window').height * 0.05,
        marginLeft: Dimensions.get('window').width * 0.05,
        paddingHorizontal: Dimensions.get('window').width * 0.025,
        marginVertical: Dimensions.get('window').height * 0.01

    },

    inputMessage: {
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 8,
        width: Dimensions.get('window').width * 0.75,
        height: Dimensions.get('window').height * 0.1,
        marginLeft: Dimensions.get('window').width * 0.05,
        paddingHorizontal: Dimensions.get('window').width * 0.025,
        marginVertical: Dimensions.get('window').height * 0.01
    },


    email: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: Dimensions.get('window').height * 0.01,
        marginLeft: Dimensions.get('window').width * 0.05
    },

    sendButton: {
        width: Dimensions.get('window').width * 0.3,
        height: Dimensions.get('window').height * 0.06,
        backgroundColor: 'black',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginTop: Dimensions.get('window').height * 0.01
    },

    sendButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },

    toggle: {
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.06,
        marginHorizontal: Dimensions.get('window').width * 0.05,
        marginVertical: Dimensions.get('window').height * 0.01,
        borderWidth: 0.5,
        borderColor: 'black',
        borderRadius: 8,
        justifyContent: 'center'
    },

    toggleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: Dimensions.get('window').width * 0.05

    },

    arrowIcon: {
        position: 'absolute',
        right: Dimensions.get('window').width * 0.05
    },

    accountDeletionMessage: {
        fontSize: 15,
        marginHorizontal: Dimensions.get('window').width * 0.075,
        textAlign: 'justify',
    },

    deleteAccountButton: {
        width: Dimensions.get('window').width * 0.35,
        height: Dimensions.get('window').height * 0.05,
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 10,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },

    deleteAccountButtonText: {
        color: 'red',
        fontSize: 15,
        fontWeight: 'bold'
    }

})
    

export default HelpScreen;