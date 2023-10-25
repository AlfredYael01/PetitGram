import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddScreen from './Add'; // Adjust the import path as needed

jest.mock('expo-media-library',() => {
    return{
      requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
      getAssetsAsync: jest.fn(() => Promise.resolve({ mediaType: 'photo' })),
    }
  })
  jest.mock('expo-media-library',() => {
    return{
      requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
      getAssetsAsync: jest.fn(() => Promise.resolve({ mediaType: 'photo' })),
    }
  })

describe('AddScreen', () => {
  test('it calls handlePost when "Post" button is pressed', () => {
    const handlePostMock = jest.fn();
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<AddScreen navigation={navigation} handlePost={handlePostMock} />);
    
    // Find and press the "Post" button
    const postButton = getByText('Post');
    fireEvent.press(postButton);

    // Expect that the handlePost function has been called
    expect(handlePostMock).toHaveBeenCalled();
  });
});