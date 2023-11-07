import React, { useState } from 'react';
import { TouchableOpacity, Text, TextInput, View, StyleSheet, Image } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export default Register = ({ navigation }) => {
    const defaultPhoto = 'https://firebasestorage.googleapis.com/v0/b/petitgram-b48fd.appspot.com/o/Profile%2FuserImage.png?alt=media&token=29660ffe-caba-4fe6-b028-09af3f446b74&_gl=1*i459ow*_ga*NDMzMjcyMjA3LjE2OTU4ODMxMjk.*_ga_CW55HF8NVT*MTY5OTM0NzExOC4xOS4xLjE2OTkzNDcxNzIuNi4wLjA';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validatePassword, setValidatePassword] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(defaultPhoto);
    const [error, setError] = useState('');

    const checkForEmptyFields = () => {
        if (email === '' || password === '') {
            setError('Email and password fields cannot be empty.');
            return true;
        }
        if (pseudo === '' || name === '' || description === '' || photo === '') {
            setError('Pseudo, name, description fields cannot be empty.');
            return true;
        }
        return false;
    }

    const checkForPasswordStrength = () => {
        // check if they match
        console.log(password);
        console.log(validatePassword);
        if (password !== validatePassword) {
            setError('Passwords do not match.');
            return true;
        }
        // at least one number, one lowercase and one uppercase letter and at least six characters
        re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        console.log(re.test(password));
        if (!re.test(password)) {
            setError('Password must contain at least one number, one lowercase and one uppercase letter and at least six characters.');
            return true;
        }
        return false;
    }

    const checkForEmailFormat = () => {
        // Email format validation
        var re = /\S+@\S+\.\S+/;
        if (!re.test(email)) {
            setError('Email format is invalid.');
            return true;
        }
        return false;
    }

    const checkForPseudoUniqueness = async () => {
        // check if pseudo is unique from firestore
        const db = getFirestore();
        const querySnapshot = await getDocs(query(collection(db, "users"), where("pseudo", "==", pseudo)));
        if (querySnapshot.size > 0) {
            setError('Pseudo already exists.');
            return true;
        }
        return false;
    }


    const onSignUp = async () => {
        setError('');
        // Validate data integrity
        if (checkForEmptyFields() || checkForEmailFormat() || checkForPasswordStrength()) {
            if (error === '')
                setError('Something went wrong. Please try again.');
            return;
        }

        if (await checkForPseudoUniqueness()) {
            return;
        }

        // Create user with email and password if not exists
        const auth = getAuth();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Signed in
            const userId = userCredential.user.uid;
            // upload image to firebase storage and wait for url to be returned
            await uplodProfilePicture(userId);
            //add to firestore
            await addUser(userId);
            // ...
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            setError(error + " " + errorMessage);
            return;
        }
    }

    const imagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
          base64: true,
        });
    
        if (!result.canceled) {
          setPhoto(result.uri);
        }
      };

    const uplodProfilePicture = async (userId) => {
        if (photo === defaultPhoto) {
            return;
        }
        const storage = getStorage();
        const storageRef = ref(storage, 'users/' + userId + '/profilePicture');
        const response = await fetch(photo);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        setPhoto(url);
    }



    const addUser = async (userId) => {
        const db = getFirestore();
        const docRef = await addDoc(collection(db, "users"), {
          _id: userId,
          pseudo: pseudo,
          name : name,
          photo: photo,
          email: email,
          description : description,
        });
        console.log("Document written with ID: ", docRef.id);
      }

      return (
        <View style={styles.container}>
          <View style={styles.form}>
            <View style={styles.imagePicker}>
              <Image source={{ uri: photo }} style={styles.image} />
              <TouchableOpacity style={styles.imagePickerButton} onPress={imagePicker}>
                <Text style={styles.imagePickerButtonText}>Change Profile Picture</Text>
              </TouchableOpacity>
            </View>
      
            <Text style={styles.sectionTitle}>Account Information</Text>
            <TextInput
              style={[styles.textInput, error.includes('Email') && styles.errorInput]}
              placeholder="Email"
              required
              onChangeText={(email) => setEmail(email)}
            />
            <TextInput
              style={[styles.passwordInput, error.includes('assword') && styles.errorInput]}
              placeholder="Password"
              secureTextEntry={true}
              onChangeText={(pass) => setPassword(pass)}
            />
            <TextInput
              style={[styles.passwordInput, password === validatePassword && styles.validatedInput]}
              placeholder="Validate Password"
              secureTextEntry={true}
              onChangeText={(validatePassword) => setValidatePassword(validatePassword)}
            />
      
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TextInput
              style={[styles.textInput, error.includes('Pseudo') && styles.errorInput]}
              placeholder="Pseudo"
              onChangeText={(pseudo) => setPseudo(pseudo)}
            />
            <TextInput
              style={[styles.textInput, error.includes('ame') && styles.errorInput]}
              placeholder="Name"
              onChangeText={(name) => setName(name)}
            />
            <TextInput
              style={[styles.textInput, error.includes('escription') && styles.errorInput]}
              placeholder="Description"
              onChangeText={(description) => setDescription(description)}
            />
      
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={() => onSignUp()}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.login} onPress={() => navigation.navigate('Login')}>
                <Text style = {{color: '#3498DB'}}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
      
      
}

styles = StyleSheet.create({
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
    errorText: {
      color: 'red',
      marginBottom: 10,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    login: {
        marginTop: 20,
        alignItems: 'center',
    }
  });
  