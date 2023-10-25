import {View, Text} from 'react-native'
import React, { useEffect, useState } from 'react';
import { getAuth, signOut} from 'firebase/auth';

const SignoutScreen = () => {

    useEffect(() => {

        const auth = getAuth();
        signOut(auth);
        
    }
   ,[]
    )


    return(
        <View>
            <Text>Signing out...</Text>
        </View>
    )
}

export default SignoutScreen;