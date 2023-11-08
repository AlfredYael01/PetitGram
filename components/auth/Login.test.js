import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from './Login';
import {getAuth, signInWithEmailAndPassword} from "firebase/auth"; // Assurez-vous d'ajuster le chemin d'importation en conséquence


// Mock Firebase Authentication
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    signInWithEmailAndPassword: jest.fn((email, password) => {
        if (email === 'anis@gmail.com' && password === 'password') {
            // Return a Promise which resolves with a mocked user object
            // a promise is returned because signInWithEmailAndPassword is an async function
            return Promise.resolve({
                user: {
                    uid: 'mockUid',
                },
            });

        } else {
            // Return a Promise which rejects with a mock Firebase error
            // a promise is returned because signInWithEmailAndPassword is an async function
            return Promise.reject({
                code: 'auth/wrong-password',
                message: 'The password is invalid or the user does not have a password.',
            });
        }
    }),
    onAuthStateChanged: jest.fn(),
}));

//mock redux
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

test('Connexion réussie avec un email et un mot de passe valides', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Sign In');
    fireEvent.changeText(emailInput, 'anis@gmail.com');
    fireEvent.changeText(passwordInput, 'password');
    expect(getByText('Sign In')).toBeTruthy();
    //console log emailInput value
    fireEvent.press(loginButton);
    console.log(emailInput.props.value);
    console.log(passwordInput.props.value);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(getAuth(), 'anis@gmail.com', 'password');
});

