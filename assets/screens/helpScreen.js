import {View, Text, StyleSheet, Dimensions, TextInput, KeyboardAvoidingView, Platform, ScrollView,Alert} from 'react-native'
import React, {useState, useEffect} from 'react'
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, updateDoc, doc} from 'firebase/firestore';
import { getAuth, deleteUser, signInWithEmailAndPassword} from 'firebase/auth';
import { TouchableOpacity } from 'react-native-gesture-handler'
import Feather from 'react-native-vector-icons/Feather';
import { getStorage, deleteObject, ref, listAll} from 'firebase/storage';
import Dialog from "react-native-dialog";


const HelpScreen = () => {

    //const userId = getAuth().currentUser.uid;
    //const db = getFirestore();
    const [messageInfo, setMessageInfo] = useState({userId: '', firstName: '', lastName: '', email: '', message: ''});
    const [contactToggle, setContactToggle] = useState(false);
    const [GuideUtilisationToggle, setGuideUtilisationToggle] = useState(false);
    const [accountDeletiontoggle, setAccountDeletionToggle] = useState(false);
    const [createAccountToggle, setCreateAccountToggle] = useState(false);
    const [createPostToggle, setCreatePostToggle] = useState(false);
    const [searchFollowToggle, setSearchFollowToggle] = useState(false);
    const [recoverAccountToggle, setRecoverAccountToggle] = useState(false);
    const [dataDeletedToggle, setDataDeletedToggle] = useState(false);
    const [filterPostsToggle, setFilterPostsToggle] = useState(false);

    //const [postsId, setPostsId] = useState([]);
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
            console.log("User:", user)

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
            deleteUserFilesAndSubfolders();
            deletePostsAndLikes();
            deleteFollowersAndFollowed();
            deleteAuth();

        }).catch((error) => {   
            console.log("Error deleting user: ", error);
        })
    }

    const deleteUserFiles = async (folderRef) => {
        try {
          const listResult = await listAll(folderRef);

          // Delete each item (file or subfolder) in the folder
          const deleteItemPromises = listResult.items.map(itemRef =>
            deleteObject(itemRef).then(() => {
              console.log("Item deleted");
            }).catch((error) => {
              console.log("Error deleting item: ", error);
            })
          );
      
          await Promise.all(deleteItemPromises);
      
          // Recursively delete subfolders
          const subfolderPromises = listResult.prefixes.map(subfolderRef =>
            deleteUserFiles(subfolderRef)
          );
      
          await Promise.all(subfolderPromises);
      
          console.log(`All items in the folder ${folderRef.name} deleted`);
      
        } catch (error) {
          console.error(`Error deleting folder ${folderRef.name} contents:`, error);
        }
      };
      
      const deleteUserFilesAndSubfolders = async () => {
        const userId = getAuth().currentUser.uid;
        const storage = getStorage();
        const userFolderRef = ref(storage, `${userId}`);
      
        await deleteUserFiles(userFolderRef);
      
        console.log("All user files and subfolders deleted");
      };
      
    const deletePostsAndLikes = async () => {
        const userId = getAuth().currentUser.uid;
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "posts"));
        //setPostsId(querySnapshot.docs.map(doc => doc.id));
        //setPosts(querySnapshot.docs.map(doc => doc.data()));


        
        //delete images from storage
        for (const doc of querySnapshot.docs) {

              //delete likes made by the user. The likes are stocked on the likes field of the post
            if(doc.data()?.likes?.includes(userId)){
                let likes = doc.data().likes;
                const index = likes.indexOf(userId);
                likes.splice(index, 1);
                //doc.ref.update({likes: doc.data().likes});
                //const ref = doc(db, "posts", doc.id)
                await updateDoc(doc.ref, {likes});
                console.log("Likes deleted")
            }
            
            if(doc.data().userId == userId){
                
                deleteDoc(doc.ref).then(() => {      
                    console.log("Post deleted")
                }).catch((error) => {
                    console.log("Error deleting post: ", error);
                })
            }
        }
    }

    const deleteFollowersAndFollowed = async () => {

        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const db = getFirestore();

        const querySnapshot = await getDocs(collection(db, "users"));

        for(const doc of querySnapshot.docs) {

            if(doc.data()?.followers?.includes(userId)){
                let followers = doc.data().followers;
                const index = followers.indexOf(userId);
                followers.splice(index, 1);
                await updateDoc(doc.ref, {followers});
                //doc.ref.update({followers: doc.data().followers});
                console.log("Followers deleted")
            }

            if(doc.data()?.followed?.includes(userId)){
                let followed = doc.data().followed;
                const index = followed.indexOf(userId);
                followed.splice(index, 1);
                await updateDoc(doc.ref, {followed});
                //doc.ref.update({followed: doc.data().followed});
                console.log("Followed deleted")
            }
        }

    }
 
    const deleteComments = async () => {

        const userId = getAuth().currentUser.uid;
        const db = getFirestore();

        const querySnapshot = await getDocs(collection(db, "posts"));
        //setPostsId(querySnapshot.docs.map(doc => doc.id));
        const postsId = querySnapshot.docs.map(doc => doc.id);

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




    useEffect(() => {
        const fetchData = async () => {
            // You can await here
            const userId = await getUserId();
            setMessageInfo({...messageInfo, userId: userId})
            getUserInfo(userId);
        };

        fetchData();
    }, []);



    return(

    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView>
                <View style={styles.toggleBox}>
                    <TouchableOpacity style={styles.toggle} onPress={() => setGuideUtilisationToggle(!GuideUtilisationToggle)}>
                        <Text style={styles.toggleText}>User guide</Text>
                        <Feather name={GuideUtilisationToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                    </TouchableOpacity>

                    {GuideUtilisationToggle &&
                        <View style={styles.toggleBox}>
                        <TouchableOpacity style={styles.subToggle} onPress={() => setCreatePostToggle(!createPostToggle)}>
                            <Text style={styles.subToggleText}>How to create a post ?</Text>
                            <Feather name={createPostToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                        </TouchableOpacity>
                            {createPostToggle &&
                            <View>
                                <Text style={styles.title2}>
                                    1. Navigate to the main feed:
                                </Text>
                                <Text style={styles.subText}>
                                    - Start by navigating to the main feed on PetitGram.
                                </Text>
                                <Text style={styles.title2}>
                                    2. Click on the "Add" button:
                                </Text>
                                <Text style={styles.subText}>
                                    - Once on the main feed, locate and click the "Add" button located at the bottom of the screen. This action will redirect you to the post creation screen.
                                </Text>
                                <Text style={styles.title2}>
                                    3. Select images for the post:
                                </Text>
                                <Text style={styles.subText}>
                                    - On the post creation screen, you will be prompted to select one or more images.
                                </Text>
                                <Text style={styles.title2}>
                                    4. Tap the "Next" button:
                                </Text>
                                <Text style={styles.subText}>
                                    - After choosing the images, proceed by tapping the "Next" button.
                                </Text>
                                <Text style={styles.title2}>
                                    5. Provide a description for the post:
                                </Text>
                                <Text style={styles.subText}>
                                    - At this point, you can provide a description for the post.
                                </Text>
                                <Text style={styles.title2}>
                                    6. Validate and publish the post:
                                </Text>
                                <Text style={styles.subText}>
                                    - Finally, validate the post to publish it on the main feed of PetitGram. Others can then express their appreciation by liking, commenting on the post, or choosing to follow you.
                                </Text>
                                </View>
                            }
                        <TouchableOpacity style={styles.subToggle} onPress={() => setSearchFollowToggle(!searchFollowToggle)}>
                            <Text style={styles.subToggleText}>How to search someone ?</Text>
                            <Feather name={searchFollowToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                        </TouchableOpacity>
                            {searchFollowToggle &&
                            <View>
                                <Text style={styles.title2}>
                                    1. Navigate to the main feed:
                                </Text>
                                <Text style={styles.subText}>
                                    - Start by navigating to the main feed on PetitGram.
                                </Text>
                                <Text style={styles.title2}>
                                    2. Click on the search button:
                                </Text>
                                <Text style={styles.subText}>
                                    - Once on the main feed, locate and click on the search button located at the bottom of the screen. This action will redirect you to the search screen.
                                </Text>
                                <Text style={styles.title2}>
                                    3. Type the username in the search bar:
                                </Text>
                                <Text style={styles.subText}>
                                    - On the search screen, you can search for a user by typing their username in the search bar.
                                </Text>
                                <Text style={styles.title2}>
                                    4. View search results:
                                </Text>
                                <Text style={styles.subText}>
                                    - If the user exists, their profile will appear in the search results.
                                </Text>
                                <Text style={styles.title2}>
                                    5. Access the user's profile:
                                </Text>
                                <Text style={styles.subText}>
                                    - Click on the user's profile to access it.
                                </Text>
                                <Text style={styles.title2}>
                                    6. Follow or Unfollow the user:
                                </Text>
                                <Text style={styles.subText}>
                                    - Once on the profile, you can choose to follow or unfollow the user by clicking on the "Follow" or "Unfollow" button.
                                </Text>
                                </View>
                            }
                            <TouchableOpacity style={styles.subBigToggle} onPress={() => setFilterPostsToggle(!filterPostsToggle)}>
                                <Text style={styles.subToggleText}>How can I see posts only{'\n'} from my followers?</Text>
                                <Feather name={recoverAccountToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                            </TouchableOpacity>
                            {filterPostsToggle &&
                                <View>
                                    <Text style={styles.title2}>
                                        1. Navigate to the main feed:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - Start by navigating to the main feed on PetitGram.
                                    </Text>
                                    <Text style={styles.title2}>
                                        2. Go on the toggle filter:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - On the top left corner, locate and click on the filter button. {'\n'}
                                        - This action will switch on the filter and only the posts from users who are following you will be displayed.
                                    </Text>
                                    <Text style={styles.title2}>
                                        3. Click on the filter button again to switch to default mode:
                                    </Text>
                                    <Text style={styles.subText}>
                                    - To switch back to the default mode, click on the filter button again.
                                    </Text>
                                </View>
                            }
                            <TouchableOpacity style={styles.subBigToggle} onPress={() => setCreateAccountToggle(!createAccountToggle)}>
                                <Text style={styles.subToggleText}>Why was my post/comment {'\n'} deleted ?</Text>
                                <Feather name={createAccountToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                            </TouchableOpacity>
                            { createAccountToggle &&
                                <View>
                                    <Text style={styles.title2}>
                                        1. Check the Community Guidelines:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - Make sure you've read and understood PetiGram's Community Guidelines (CGU). {'\n'}
                                        - Your post/comment may have been removed for violating these rules.
                                    </Text>
                                    <Text style={styles.title2}>
                                        2. Inappropriate Content:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - Posts or comments with explicit content or hate speech may be deleted. {'\n'}
                                        - Ensure your content aligns with the community standards.
                                    </Text>
                                    <Text style={styles.title2}>
                                        3. Respect Others:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - Respect the rights and privacy of other users. {'\n'}
                                        - Harassment, intimidation, or defamation may lead to content removal.
                                    </Text>
                                    <Text style={styles.title2}>
                                        4. Avoid Spam:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - Don't excessively post similar content, which can be considered spam. {'\n'}
                                        - Promotional posts unrelated to the community may also be removed.
                                    </Text>
                                </View>
                            }
                            <TouchableOpacity style={styles.subBigToggle} onPress={() => setRecoverAccountToggle(!recoverAccountToggle)}>
                                <Text style={styles.subToggleText}>Can I recover my account if I {'\n'} or the administrator deleted it?</Text>
                                <Feather name={recoverAccountToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                            </TouchableOpacity>
                            {recoverAccountToggle &&
                                <View>
                                    <Text style={styles.title2}>
                                        1. Attempt Account Recovery:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - If your account has been deleted, either by yourself or the administrator, there is no direct account recovery option available.
                                    </Text>
                                    <Text style={styles.title2}>
                                        2. Evaluate the Deletion:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - Determine whether the account deletion was justified or if it was done in error. Check if there were any violations of terms or policies.
                                    </Text>
                                    <Text style={styles.title2}>
                                        3. Contact Support:
                                    </Text>
                                    <Text style={styles.subText}>
                                        If you believe your account was unjustly deleted, proceed to contact the support team.
                                    </Text>
                                    <Text style={styles.title2}>
                                        4. Compose an Email:
                                    </Text>
                                    <Text style={styles.subText}>
                                    - Go on the toggle contact. {'\n'}
                                    - Write an email to the support team explaining your situation. {'\n'}
                                    - Include relevant details such as your username, the reason you believe the deletion was unjust, and any other pertinent information.
                                    </Text>
                                    <Text style={styles.title2}>
                                        5. Wait for Response:
                                    </Text>
                                    <Text style={styles.subText}>
                                        - After sending the email, patiently wait for a response from the support team. Response times may vary.
                                    </Text>
                                </View>
                            }
                            <TouchableOpacity style={styles.subBigToggle} onPress={() => setDataDeletedToggle(!dataDeletedToggle)}>
                                <Text style={styles.subToggleText}>When I delete my account, what happens to my data?</Text>
                                <Feather name={dataDeletedToggle ? "chevron-down" : "chevron-right"} size={25} style={styles.arrowIcon}/>
                            </TouchableOpacity>
                            {dataDeletedToggle &&
                                <View>
                                    <Text style={styles.title2}>
                                        1. Your data is removed from the database:
                                    </Text>
                                    <Text style={styles.subText}>
                                    - When you delete your account, your data is removed from the database in compliance with privacy regulations. {'\n'}
                                    - According to European data protection laws, such as the General Data Protection Regulation (GDPR), and French data protection laws, it is prohibited to retain user data after the deletion of their account. {'\n'}
                                    - The platform ensures that your information is promptly and completely erased, adhering to the legal requirements concerning data deletion upon account removal.
                                    </Text>
                                </View>
                            }
                    </View>
                    }
                </View>
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
    subText: {
        fontSize: 15,
        marginLeft: Dimensions.get('window').width * 0.20,
    },
    title2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: Dimensions.get('window').width * 0.15,
        marginVertical: Dimensions.get('window').height * 0.015,
        textDecorationLine: 'underline'

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
    subToggle: {
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').height * 0.06,
        marginHorizontal: Dimensions.get('window').width * 0.05,
        marginVertical: Dimensions.get('window').height * 0.01,
        marginLeft: Dimensions.get('window').width * 0.15,
        borderWidth: 0.5,
        borderColor: 'black',
        borderRadius: 8,
        justifyContent: 'center'
    },
    subBigToggle: {
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').height * 0.08,
        marginHorizontal: Dimensions.get('window').width * 0.05,
        marginVertical: Dimensions.get('window').height * 0.01,
        marginLeft: Dimensions.get('window').width * 0.15,
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
    subToggleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: Dimensions.get('window').width * 0.05,
        color: '#808080'
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