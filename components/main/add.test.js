import 'react-native';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ImagePicker from 'expo-image-picker';
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
  MediaTypeOptions: {
    All: 'All', // Add MediaTypeOptions with 'All' to mock the MediaTypeOptions used in your component
  },
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
  expect(getByText('Pick Image')).toBeTruthy();
  expect(queryByText('Next')).toBeTruthy();
  expect(getByText('Switch Camera')).toBeTruthy();
});

test('expo image picker is called when the user clicks on the gallery button', () => {
  
  const { getByTestId } = render(<AddScreen navigation={jest.fn()} />);
  // Mock the result to include a 'canceled' property
  ImagePicker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false, // Set to true or false as needed
    assets: [
      {
        uri: '../../assets/Yo.jpg',
      },
    ],
  });

  // Click on the gallery button
  const galleryButton = getByTestId('galleryButton');
  fireEvent.press(galleryButton);
  // Check if the pickImage function is called
  expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
});

test('Preview image is displayed when the user picks an image', async () => {
  const { getByTestId } = render(<AddScreen navigation={jest.fn()} />);
  // Mock the result to include a 'canceled' property
  ImagePicker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false, // Set to true or false as needed
    assets: [
      {
        uri: '../../assets/Yo.jpg',
      },
    ],
  });

  // Click on the gallery button
  const galleryButton = getByTestId('galleryButton');
  fireEvent.press(galleryButton);

  // Wait for the preview image to be displayed
  await waitFor(() => {
    const previewImage = getByTestId('previewImage');
    // Check if the preview image is displayed and the source is correct
    expect(previewImage).toBeTruthy();
    expect(previewImage.props.source.uri).toEqual('../../assets/Yo.jpg');
  });
}
);



  
