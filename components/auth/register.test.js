import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Register from './Register';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Mock the modules that are not available in the test environment
jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: {
        All: 'All', // Add MediaTypeOptions with 'All' to mock the MediaTypeOptions used in your component
    },
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn( () => ({
        size: 1,
        docs: [
            {
                data: jest.fn( () => ({
                    pseudo: 'test',
                })),
            },
        ],
    })),
    query: jest.fn(),
    where: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: {
        All: 'All', // Add MediaTypeOptions with 'All' to mock the MediaTypeOptions used in your component
    },
}));


describe('Register Component', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<Register navigation={jest.fn()} />);
    
    // Add assertions for rendering elements and placeholders
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Validate Password')).toBeTruthy();
    expect(getByPlaceholderText('Pseudo')).toBeTruthy();
    expect(getByPlaceholderText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByTestId('imagePickerButton')).toBeTruthy();
  });

  it('displays error messages for empty fields', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(<Register navigation={jest.fn()} />);
    
    // Trigger sign up without filling any fields
    await fireEvent.press(getByTestId('signUpButton'));
    // Add assertions for error messages
    expect(getByText('Email and password fields cannot be empty.')).toBeTruthy();

    // Fill in fields
    await fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    await fireEvent.changeText(getByPlaceholderText('Password'), 'Password1');
    await fireEvent.changeText(getByPlaceholderText('Validate Password'), 'Password1');

    // Trigger sign up
    await fireEvent.press(getByTestId('signUpButton'));

    expect (getByText('Pseudo, name, description fields cannot be empty.')).toBeTruthy();
  });

  it('displays error message for non-matching passwords', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(<Register navigation={jest.fn()} />);
    
    // Fill in fields
    await fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    await fireEvent.changeText(getByPlaceholderText('Password'), 'Password1');
    await fireEvent.changeText(getByPlaceholderText('Validate Password'), 'Password2');
    await fireEvent.changeText(getByPlaceholderText('Pseudo'), 'test');
    await fireEvent.changeText(getByPlaceholderText('Name'), 'Test User');
    await fireEvent.changeText(getByPlaceholderText('Description'), 'Test Description');
    
    // Trigger sign up
    await fireEvent.press(getByTestId('signUpButton'));
    // Add assertions for the "Passwords do not match" error message
    expect(getByText('Passwords do not match.')).toBeTruthy();
  });

  it('displays error message for invalid email format', async () => {
    const { getByText, getByPlaceholderText } = render(<Register navigation={jest.fn()} />);
    
    // Fill in fields
    await fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email-format');
    await fireEvent.changeText(getByPlaceholderText('Password'), 'Password1');
    await fireEvent.changeText(getByPlaceholderText('Validate Password'), 'Password1');
    await fireEvent.changeText(getByPlaceholderText('Pseudo'), 'test');
    await fireEvent.changeText(getByPlaceholderText('Name'), 'Test User');
    await fireEvent.changeText(getByPlaceholderText('Description'), 'Test Description');
    
    // Trigger sign up
    await fireEvent.press(getByText('Sign Up'));
    
    // Add assertions for the "Email format is invalid" error message
    expect(getByText('Email format is invalid.')).toBeTruthy();
  });

  it('displays error message for non-unique pseudo', async () => {
    const { getByText, getByPlaceholderText } = render(<Register navigation={jest.fn()} />);
    
    // Fill in fields
    await fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    await fireEvent.changeText(getByPlaceholderText('Password'), 'Password1');
    await fireEvent.changeText(getByPlaceholderText('Validate Password'), 'Password1');
    await fireEvent.changeText(getByPlaceholderText('Pseudo'), 'test');
    await fireEvent.changeText(getByPlaceholderText('Name'), 'John Doe');
    await fireEvent.changeText(getByPlaceholderText('Description'), 'Description');
    
    // Trigger sign up
    await fireEvent.press(getByText('Sign Up'));
    
    // Add an assertion for the "Pseudo already exists" error message
    expect(getByText('Pseudo already exists.')).toBeTruthy();
  });

  it('successfully registers a new user', async () => {
    // You should mock the Firebase functions used in your component, such as createUserWithEmailAndPassword and addDoc
    // You can use a library like `firebase-mock` for mocking Firebase functionality in your tests.

    const { getByText, getByPlaceholderText } = render(<Register navigation={jest.fn()} />);
    
    // Fill in valid fields
    await fireEvent.changeText(getByPlaceholderText('Email'), 'new_user@example.com');
    await fireEvent.changeText(getByPlaceholderText('Password'), 'NewUser1');
    await fireEvent.changeText(getByPlaceholderText('Validate Password'), 'NewUser1');
    await fireEvent.changeText(getByPlaceholderText('Pseudo'), 'unique_pseudo');
    await fireEvent.changeText(getByPlaceholderText('Name'), 'New User');
    await fireEvent.changeText(getByPlaceholderText('Description'), 'New User Description');

    // change the mock implementation of getDocs to return an empty query snapshot
    getDocs.mockImplementationOnce(() => ({
        size: 0,
        docs: [],
    }));
    
    // Trigger sign up
    await fireEvent.press(getByText('Sign Up'));
    
    // Add an assertion for successful registration
    // You can check if the navigation function is called to navigate to the next screen
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(getAuth(), 'new_user@example.com', 'NewUser1');
  });
});
