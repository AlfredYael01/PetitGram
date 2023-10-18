
import React, { useState } from 'react';
import * as firebase from 'firebase';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 

export default function Login(props) {
    const [email, setEmail] = "sae@gmail.com";
    const [password, setPassword] = "iutinfo";

    const onSignUp = () => {
        firebase.auth().signInWithEmailAndPassword(email, password)
    }
    return (
        <View style={container.center}>
            <View style={container.formCenter}>
                <TextInput
                    style={form.textInput}
                    placeholder="email"
                    onChangeText={(email) => setEmail(email)}
                />
                <TextInput
                    style={form.textInput}
                    placeholder="password"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />

                <Button
                    style={form.button}
                    onPress={() => onSignUp()}
                    title="Sign In"
                />
            </View>


            <View style={form.bottomButton} >
                <Text
                    title="Register"
                    onPress={() => props.navigation.navigate("Register")} >
                    Don't have an account? SignUp.
                </Text>
            </View>
        </View>
    )
};

firebase.initializeApp(firebaseConfig);
export default firebase ;
