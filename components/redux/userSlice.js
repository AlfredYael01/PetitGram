import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, query, where, addDoc } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (userId, thunkAPI) => {
        const db = getFirestore();
        const userDoc = collection(db, 'users');
        const userSnapshot = await getDocs(query(userDoc, where('_id', '==', userId)));
        const user = userSnapshot.docs[0].data();
        return user;
    }
);

export const addComment = createAsyncThunk(
    'user/addComment',
    async (postId, comment, thunkAPI) => {
        const db = getFirestore();
        const userDoc = collection(db, 'posts', postId, 'comments');
        const commentData = {
            comment: comment,
            date: new Date(),
            userId: store.getState().user.currentUser._id,
        };
        await addDoc(userDoc, commentData);
        return commentData;
    }
);

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
    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.users[action.payload._id] = action.payload;
        });
        builder.addCase(addComment.fulfilled, (state, action) => {
            state.comments[action.payload.postId].push(action.payload);
        });
    }
});

export const { setCurrentUser, setUsers, setCurrentUserPosts, setFeedPosts, setComments } = userSlice.actions;

export default userSlice.reducer;
