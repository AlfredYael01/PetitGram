import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddScreen from './Add'; // Adjust the import path as needed
jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
  }));
  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
  }));
  jest.mock('expo-media-library', () => ({
    requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
    getAssetsAsync: jest.fn(() => ({ assets: [] })),
  }));

describe('handlePost', () => {
    it('appelle alert si aucune image n\'est sélectionnée', () => {
        const { getByTestId } = render(<AddScreen navigation={jest.fn()} />)

      // Créez un mock pour la fonction alert
      global.alert = jest.fn();
      let capturedAlertMessage = null;
  
      // Appelez la fonction handlePost avec aucune image sélectionnée
      const nextButton = getByTestId('nextButton');
      fireEvent.press(nextButton);
      // Vérifiez si la fonction alert a été appelée avec le message approprié
      expect(global.alert).toHaveBeenCalledWith('Please select at least one image to post.');
      console.log(global.alert);
    });
    
  });