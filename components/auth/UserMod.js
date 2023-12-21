import React, {useEffect, useState} from 'react';
import { TouchableOpacity, Text, TextInput, View, StyleSheet, Image } from 'react-native';
import { getAuth,validatePassword, updatePassword} from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../redux/refreshSlice";
import * as ImagePicker from 'expo-image-picker';

export default UserMod = ({ navigation }) => {
    const auth = getAuth();
    const dispatch = useDispatch();
    const refresh = useSelector((state) => state.refresh.refresh);

    const userId = auth.currentUser.uid;
    const user = auth.currentUser;
    const [profile, setProfile] = useState('');
    const [photo, setPhoto] = useState(profile.photo);
    const [pseudo, setPseudo] = useState(profile.pseudo);
    const [name, setName] = useState(profile.name);
    const [description, setDescription] = useState(profile.description);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const getUserInfo = async () => {
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "users"));
        //console.log("QuerySnapshot: ",querySnapshot);

        querySnapshot.forEach((doc) => {
            //console.log("Data: ", doc.data());
            if (doc.data()._id === userId) {
                setProfile(doc.data());
                setPhoto(doc.data().photo);
                setPseudo(doc.data().pseudo);
                setName(doc.data().name);
                setDescription(doc.data().description);
            }
        })
    }
    useEffect(() => {
        getUserInfo();
    }, []);
    const imagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const uploadProfilePicture = async (userId) => {

        const storage = getStorage();
        const imageFileName = 'Profile/' + userId + '.jpg';
        const storageRef = ref(storage, imageFileName);
        const uploadTask = uploadBytes(storageRef, photo);
        await uploadTask;
        const url = await getDownloadURL(storageRef);
        console.log("url: ", url);
        setPhoto(url);
    }
    // const checkForEmptyFields = () => {
    //     if (password === '') {
    //         console.log('Password cannot be empty');
    //         return true;
    //     }
    //     console.log("password1: ", password);
    //     return false;
    // };
    //
    // const checkForPasswordStrength = () => {
    //     // check if they match
    //     if (password !== validatePassword) {
    //         console.log('Passwords do not match.');
    //         return true;
    //     }
    //     // at least one number, one lowercase and one uppercase letter and at least six characters
    //     re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    //     if (!re.test(password)) {
    //         console.log('Password must contain at least one number, one lowercase and one uppercase letter and at least six characters.');
    //         return true;
    //     }
    //     console.log("password2: ", password);
    //     return false;
    //
    // }
    // const checkForPseudoUniqueness = async (pseudo) => {
    //     try {
    //
    //         if (pseudo === '') {
    //             return false;
    //         }
    //
    //         const db = getFirestore();
    //         const querySnapshot = await getDocs(query(collection(db, "users"), where("pseudo", "==", pseudo)));
    //
    //         if (querySnapshot.size > 0) {
    //             console.log('Pseudo already exists.');
    //             return true;
    //         }
    //         return false;
    //     } catch (error) {
    //         console.log("Error as been found :", error);
    //         throw error;
    //     }
    // };

     const updateUser = async () => {
    //     // if (checkForEmptyFields()) {
    //     //     if (error === '') {
    //     //         // Wait for the error to be set
    //     //         await new Promise((resolve) => setTimeout(resolve, 1000));
    //     //     }
    //     //     //console.log("Error: ", error);
    //     //     console.log("Erreur y a r dans le field")
    //     //     return;
    //     //
    //     // }
    //     if (await checkForPseudoUniqueness()) {
    //         //console.log("Error: ", error);
    //         console.log("Error: ", error);
    //         return;
    //     }

        // const checkPasswordTrue = validatePassword(password);
        // console.log("checkPasswordTrue: ", checkPasswordTrue);
        // if (checkPasswordTrue === false) {
        //     console.log('Your password is wrong ');
        //     return;
        // }


        //update user in firestore
        const db = getFirestore();
        const userRef = collection(db, "users");
         const userQuery = query(userRef, where('_id', '==', userId));
         const querySnapshot = await getDocs(userQuery);

        querySnapshot.forEach(async(doc) => {
            const docRef = doc.ref;
            await updateDoc(docRef, {
                pseudo: pseudo,
                password: password,
                name: name,
                description: description,
                photo: photo,
            })
            console.log("User updated");
        })
         if (refresh == false)
            dispatch(toggle());

    }

    return (
        <View style={stylesLog.container}>
            <View style={stylesLog.form}>
                <View style={stylesLog.imagePicker}>
                    <Image source={{uri: photo}} style={stylesLog.image} />
                    <TouchableOpacity style={styles.imagePickerButton} onPress={imagePicker} testID="imagePickerButton">
                        <Text style={styles.imagePickerButtonText}>Change Profile Picture</Text>
                    </TouchableOpacity>
                </View>

                <Text style={stylesLog.sectionTitle}>Account Information</Text>
                <TextInput
                    style={[stylesLog.textInput]}
                    value={profile.email}
                    editable={false}
                />
                <TextInput
                    style={[stylesLog.passwordInput]}
                    placeholder="Password"
                    required
                    secureTextEntry={true}
                />
                <TextInput
                    style={[stylesLog.passwordInput]}
                    placeholder="New Password"
                    onChangeText={(text) => setPassword(text)}
                />
                <TextInput
                    style={[stylesLog.passwordInput]}
                    placeholder="Validate Password"
                    onChangeText={(text) => setPassword(text)}
                />

                <Text style={stylesLog.sectionTitle}>Profile Information</Text>
                <TextInput
                    style={[stylesLog.textInput]}
                    placeholder={pseudo}
                    value={pseudo}
                    onChangeText={(text) => setPseudo(text)}
                />
                <TextInput
                    style={[stylesLog.textInput]}
                    placeholder={name}
                    value={name}
                    onChangeText={(text) => setName(text)}
                />
                <TextInput
                    style={[stylesLog.textInput]}
                    placeholder={description}
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                />

                <TouchableOpacity style={stylesLog.button} onPress={ async() => {
                    await uploadProfilePicture(userId)
                    await updateUser()
                    navigation.goBack()
                }} testID="ModUser">
                    <Text style={stylesLog.buttonText}>Modify profil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
            }

const stylesLog = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    imagePicker: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imagePickerButton: {
        backgroundColor: '#3498DB',
        borderRadius: 5,
        padding: 10,
    },
    imagePickerButtonText: {
        color: '#FFFFFF',
    },
    form: {
        width: '80%',
    },
    textInput: {
        height: 40,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 5,
        color: '#333',
    },
    passwordInput: {
        height: 40,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 5,
        color: '#333',
    },
    errorInput: {
        borderColor: 'red',
    },
    validatedInput: {
        borderColor: 'green',
    },
    button: {
        backgroundColor: '#3498DB',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 50,
        marginBottom: 10,
    }
});