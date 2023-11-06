import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddScreen from './Add'; // Adjust the import path as needed
import ImagePicker from 'expo-image-picker';
import Add from './Add';
import { act } from 'react-test-renderer';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import defaultExport, {getFirestore, collection, addDoc} from 'firebase/firestore';
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

  // jest.mock('firebase/firestore', () => ({

  //   getFirestore: jest.fn(),
  //   collection: jest.fn(),
  //   addDoc: jest.fn(async (collectionRef, data) => {
  //     // You can return a mock docRef with your desired properties
  //     const docRef = {
  //       id: 'postId',
  //       collectionRef,
  //       data, 
  //     };
  //     return docRef;
  //   }),

  // }));

  jest.mock('expo-media-library', () => ({

    requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
    getAssetsAsync: jest.fn(() => ({ assets: [] })),

  }));

  jest.mock('firebase/firestore', () => {
    const defaultExport = jest.requireActual('firebase/firestore');
  
return {
    __esModule: true,
    ...defaultExport,
    default: jest.fn(() => 'mocked default'),
    addDoc: 'mocked addDoc',
    getFirestore: 'mocked getFirestore',
    collection: 'mocked collection',
  };
});

  jest.mock('expo-image-picker', () => {
    return {
      launchImageLibraryAsync: jest.fn(() => Promise.resolve({ uri: '../../assets/Yo.jpg', cancelled: false,
  
      allowsEditing: true,
      assets:[{uri:'../../assets/Yo.jpg'}],
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

describe('handlePost', () => {
    it('appelle alert si aucune image n\'est sélectionnée', async () => {
        const { getByTestId } = render(<AddScreen navigation={jest.fn()} />)

      // Créez un mock pour la fonction alert
      global.alert = jest.fn();
      // Appelez la fonction handlePost avec aucune image sélectionnée
      const nextButton = getByTestId('nextButton');
      fireEvent.press(nextButton);
      // Vérifiez si la fonction alert a été appelée avec le message approprié
      expect(global.alert).toHaveBeenCalledWith('Please select at least one image to post.');
      // console.log(global.alert); 
    });
});
   