import { createSlice } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: null,
        users: {},
        currentUserPosts: [],
        feedPosts: [],
        comments : {},
    },
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        setCurrentUserPosts: (state, action) => {
            state.currentUserPosts = action.payload;
        },
        setFeedPosts: (state, action) => {
            state.feedPosts = action.payload;
        },
        setComments: (state, action) => {
            state.comments = action.payload;
        },
    },
});

export const { setCurrentUser, setUsers, setCurrentUserPosts, setFeedPosts } = userSlice.actions;

export default userSlice.reducer;
