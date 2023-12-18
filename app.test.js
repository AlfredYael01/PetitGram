import React from 'react';
import renderer from 'react-test-renderer';
import App from './App';
import TestRenderer from 'react-test-renderer';
import Login from './components/auth/Login';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// mock firebase/auth module
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('@firebase/auth'),
  getReactNativePersistence: () => console.debug('Initialized persistence ...'),
}));

describe('<App />', () => {
  it('to have a valid snapshot', () => {
    const component = TestRenderer.create(<App />);
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  }
  );
}
);  