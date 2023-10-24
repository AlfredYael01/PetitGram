import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UserProfileScreen from '../../assets/screens/userProfileScreen';
import Add from './Add';
// Mock the ImagePicker function
jest.mock('expo-image-picker', () => {
  return {
    launchImageLibraryAsync: jest.fn(() => Promise.resolve({ uri: 'Yo.jpg', cancelled: false })),
  };
});

describe('UserProfileScreen', () => {
  test('it should pick and display an image', async () => {
    const { getByText, getByTestId } = render(<Add />);
    
    // Find and press the "Select Image" button
    const selectImageButton = getByText('Pick Image');
    fireEvent.press(selectImageButton);
    
    // Wait for the image to load
    await waitFor(() => {
      // Check if the selected image is displayed
      const selectedImage = e=getByTestId('test-image-uri.jpg');
      expect(selectedImage).toBeTruthy();
    });
  });
});
