import React from 'react';
import renderer from 'react-test-renderer';
import App from './App';
import TestRenderer from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// mock firebase/auth module
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('@firebase/auth'),
  getReactNativePersistence: () => console.debug('Initialized persistence ...'),
}));

describe('<App />', () => {
  it('login renders correctly', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});