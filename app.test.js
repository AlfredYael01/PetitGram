import React from 'react';
import App from './App';
import { LogBox } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// mock firebase/auth module
jest.mock('firebase/auth', () => ({
    ...jest.requireActual('@firebase/auth'),
    getReactNativePersistence: () => console.debug('Initialized persistence ...'),
}));

// mock LogBox ignoreLogs method 
// Mocking the import statement for LogBox
jest.mock('react-native', () => {
    const originalReactNative = jest.requireActual('react-native');
  
    return {
      ...originalReactNative,
      LogBox: {
        // Your mocked LogBox implementation goes here
        ignoreLogs: jest.fn(),
        // Add any other methods or properties you need for testing
      },
    };
  });
  
describe('App Component', () =>
{
    it('renders correctly', async () =>
    {
        const { getByTestId } = render(<App />);
        const app = await waitFor(() => getByTestId('app'));
        expect(app).toBeTruthy();
    });
});