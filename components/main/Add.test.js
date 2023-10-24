import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UserProfileScreen from '../../assets/screens/userProfileScreen';
import Add from './Add';
import { MediaLibraryAssetInfoQueryOptions } from 'expo-media-library';
// Mock the ImagePicker function
jest.mock('expo-image-picker', () => {
  return {
    launchImageLibraryAsync: jest.fn(() => Promise.resolve({ uri: 'Yo.jpg', cancelled: false,

    allowsEditing: true,
    assets:[{uri:'Yo.jpg'}],
    aspect: [1, 1],
    quality: 1, })),
    MediaTypeOptions : jest.fn(),

  }
})

jest.mock('expo-media-library',() => {
  return{
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getAssetsAsync: jest.fn(() => Promise.resolve({ mediaType: 'photo' })),
  }
})
describe('UserProfileScreen', () => {
  test('it should pick and display an image', async () => {
    const { getByText, getByTestId } = render(<Add />);
    
    // Find and press the "Select Image" button
    const selectImageButton = getByText('Pick Image');
    fireEvent.press(selectImageButton);
    
    // Wait for the image to load
    await waitFor(() => {
      // Check if the selected image is displayed
      const selectedImage = getByTestId("publication-image");
      console.log(selectedImage);
      expect(selectedImage).toBeTruthy();
    });
  });
});
