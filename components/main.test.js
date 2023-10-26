import 'react-native';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import MainScreen from './Main';
import test from 'node:test';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  onSnapshot: jest.fn(), // mock the onSnapshot function
  orderBy: jest.fn(), // mock the orderBy function
  query: jest.fn(), // mock the query function
  where: jest.fn(), // mock the where function
  getDocs: jest.fn(), // mock the getDocs function
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'mockUserId',
    },
  })),
}));

// undified reading prop 'forEach'
const querySnapshot = {
  docs: [],
};

// mock the querySnapshot.forEach function
querySnapshot.forEach = jest.fn((callback) => {
  callback({
    data: jest.fn(() => ({
      userId: 'mockUserId',
    })),
  });
});

// mock the getDocs function
const getDocs = jest.fn(() => querySnapshot);




test('renders MainScreen with tabs', async () => {
  const { getAllByA11yValue } = render(<MainScreen />);
  
  // Wait for the component to be fully rendered before attempting to access elements.
  await waitFor(() => {
    const feedTab = getAllByA11yValue('Feed, tab, 1 of 4');
    const searchTab = getAllByA11yValue('Search, tab, 2 of 4');
    const addTab = getAllByA11yValue('Add, tab, 3 of 4');
    const profileTab = getAllByA11yValue('Profile, tab, 4 of 4');

    // Check if the tabs are found
    expect(feedTab).toBeTruthy();
    expect(searchTab).toBeTruthy();
    expect(addTab).toBeTruthy();
    expect(profileTab).toBeTruthy();
  });
});
