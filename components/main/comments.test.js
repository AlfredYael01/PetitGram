// Import necessary libraries and modules
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CommentsScreen from './CommentsScreen';

// Mock react-redux to provide mock store and dispatch functions
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock your redux actions or helper functions
jest.mock('../redux/refreshSlice', () => ({
  ...jest.requireActual('../redux/refreshSlice'),
  toggle: jest.fn(),
}));

jest.mock('../helper/posts', () => ({
  ...jest.requireActual('../helper/posts'),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  updateComment: jest.fn(),
}));

// Mock other dependencies like react-native-feather, react-native-vector-icons, etc.
jest.mock('react-native-feather', () => ({
  ...jest.requireActual('react-native-feather'),
  // Mock other components or functions from react-native-feather
}));

jest.mock('react-native-vector-icons/SimpleLineIcons', () => ({
  ...jest.requireActual('react-native-vector-icons/SimpleLineIcons'),
  // Mock other components or functions from SimpleLineIcons
}));

jest.mock('react-native-popup-menu', () => ({
  ...jest.requireActual('react-native-popup-menu'),
  // Mock other components or functions from react-native-popup-menu
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  // Mock other components or functions from react-native
}));

// Mock Alert component
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

// Example test
describe('CommentsScreen', () => {
  test('renders correctly', () => {
    // Mock the useSelector hook with sample data
    useSelector.mockReturnValueOnce([
      { comment: 'Test Comment 1', userId: 'user1', date: new Date().toISOString() },
      { comment: 'Test Comment 2', userId: 'user2', date: new Date().toISOString() },
    ]);

    const { getByText, getByPlaceholderText } = render(<CommentsScreen route={{ params: { post: { id: 'post1' } } }} />);

    // Check if the component renders the comments correctly
    expect(getByText('Test Comment 1')).toBeTruthy();
    expect(getByText('Test Comment 2')).toBeTruthy();

    // Check if the input field is present
    expect(getByPlaceholderText('Add a comment...')).toBeTruthy();
  });

  // Add more tests as needed for other functionalities such as handling comments, editing, deleting, etc.
});
