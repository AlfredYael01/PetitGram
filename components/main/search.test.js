import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchScreen from './Search';

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(
        () => ({
            getDocs: jest.fn(() => ({
                docs: [
                    {
                        id: 'user_id_here',
                        data: () => ({
                            name: 'John Doe',
                            pseudo: 'john_doe',
                        }),
                        id : 'user2_id_here',
                        data: () => ({
                            name: 'Jane Doe',
                            pseudo: 'jane_doe',
                        }),
                    },
                ],
            })),
        }),
    ),
    getDocs: jest.fn(() => ({
        docs: [
            {
                id: 'user_id_here',
                data: () => ({
                    name: 'John Doe',
                    pseudo: 'john_doe',
                }),
                id : 'user2_id_here',
                data: () => ({
                    name: 'Jane Doe',
                    pseudo: 'jane_doe',
                }),
            },
        ],
        forEach: jest.fn((callback) => {
            callback({
                id: 'user_id_here',
                data: () => ({
                    name: 'John Doe',
                    pseudo: 'john_doe',
                }),
            });
            callback({
                id: 'user2_id_here',
                data: () => ({
                    name: 'Jane Doe',
                    pseudo: 'jane_doe',
                }),
            });
        }

        ), 

    })),
    onSnapshot: jest.fn(),

    }));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: {
        uid: 'mockUserId',
        },
    })),
    }));


describe('SearchScreen Component', () => {
  it('displays a search input', () => {
    const { getByPlaceholderText } = render(<SearchScreen navigation={jest.fn()} />);
    const searchInput = getByPlaceholderText('Search');
    expect(searchInput).toBeTruthy();
  });

    it('displays users', async () => {
        const { findByText } = render(<SearchScreen navigation={jest.fn()} />);

        const user = await findByText('John Doe');
        expect(user).toBeTruthy();
    });

    it('searches for users', async () => {
         // verifiy if the list changed
        const { getByPlaceholderText, 
                findByText, 
                queryByText, 
                getAllByText } = render(<SearchScreen navigation={jest.fn()} />);

        const searchInput = getByPlaceholderText('Search');
        // Type in the search input
        fireEvent.changeText(searchInput, 'John Doe');
        // Check if the user is not displayed
        const user2 = queryByText('Jane Doe');
        expect(user2).toBeFalsy();
    });

    it('displays a user profile when clicking on a search result', async () => {
        const navigation = {
            navigate: jest.fn(),
        };

        const { findByText } = render(<SearchScreen navigation={navigation} />);

        const user = await findByText('John Doe');
        // Click on a search result
        fireEvent.press(user);
        
        // Add an assertion to check if the navigation function is called with the correct route
        expect(navigation.navigate).toHaveBeenCalledWith('searchUserProfileScreen', { user: { id: 'user_id_here',  name: 'John Doe', pseudo: 'john_doe' } }); // Replace 'searchUserProfileScreen' with your actual route and the user object with the expected user data.
    });
});
