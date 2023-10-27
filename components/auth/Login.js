import React, { useState } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Image } from 'react-native';
import { onAuthStateChanged, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from '../redux/store';
import { setUser } from '../redux/userActions';

export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const dispatch = useDispatch();

    const onSignUp = () => {
        // Create user with email and password if not exists
        const auth = getAuth();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                dispatch(setUser(user.uid)); // Dispatch user data to Redux
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                switch (errorCode) {
                    case 'auth/invalid-email':
                        setError('Invalid email address format.');
                        break;
                    case 'auth/user-disabled':
                        setError('User with this email has been disabled.');
                        break;
                    case 'auth/user-not-found':
                        setError('User with this email does not exist.');
                        break;
                    case 'auth/wrong-password':
                        setError('Invalid password.');
                        break;
                    default:
                        setError('Something went wrong.');
                        break;
                }
            });

        onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(setUser(user.uid)); // Dispatch user data to Redux
            }
        });
    }

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <View style={styles.form}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    onChangeText={(email) => setEmail(email)}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                    style={styles.button}
                    onPress={() => onSignUp()}
                    title="Sign In"
                />
            </View>

            <Text
                style={styles.registerLink}
                onPress={() => props.navigation.navigate("Register")}
            >
                Don't have an account? Sign Up.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8', // Background color
    },
    logo: {
        marginBottom: 0,
        width: 250,
        height: 250,
    },
    form: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // Form background color
        padding: 20,
        borderRadius: 20, // Rounded corners
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
        shadowOpacity: 1,
        elevation: 2,
    },
    textInput: {
        width: '100%',
        height: 40,
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
    },
    button: {
        width: '100%',
        height: 40,
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: '#007BFF', // Button background color
    },
    errorText: {
        color: 'red',
        marginVertical: 10,
        textAlign: 'center',
    },
    registerLink: {
        marginTop: 20,
        color: '#007BFF', // Link color
        textDecorationLine: 'underline',
    },
});
