import 'react-native';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddScreen from './Add';

// Mock the modules that are not available in the test environment
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  CameraType: {
    back: 'back',
    front: 'front',
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  getAssetsAsync: jest.fn(() => ({ assets: [] })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'mockUserId',
    },
  })),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

test('renders AddScreen component without errors', () => {
  const { getByText, queryByText } = render(<AddScreen navigation={jest.fn()} />);

  // Check if the component renders without errors
  expect(getByText('New Post')).toBeTruthy();
  expect(queryByText('Post')).toBeTruthy();
});
  
