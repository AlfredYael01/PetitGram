import { createSlice } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: null,
        users: {},
        currentUserPosts: [],
        feedPosts: [],
    },
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
    },
});

export const { setCurrentUser, setUsers } = userSlice.actions;

export const getUsersByIds = (userIds) => {
    return async (dispatch) => {
        // remove userIds that are already in state
        const state = store.getState();
        const userIdsToFetch = userIds.filter((userId) => !state.user.users[userId]);
        if (userIdsToFetch.length === 0) {
            return;
        }
        const db = getFirestore();
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('_id', 'in', userIds));
        const userSnapshot = await getDocs(q);
        const usersTemp = userSnapshot.docs.reduce((acc, user) => {
            acc[user.data()._id] = user.data();
            return acc;
        }, {});
        dispatch(setUsers(usersTemp));
    };
};

export default userSlice.reducer;
