import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const addComment = createAsyncThunk('user/addComment', async ({ post, comment }) => {
    return { success: true, postId: post.id, comment: comment };
});

export const likeControl = createAsyncThunk('user/likeControl', async (post) => { 
    const db = getFirestore();
    const postRef = doc(db, "posts", post.id);
    // if user already liked then remove like
    const newLikes = store.getState().user.feedPosts[post.id] 
        ? store.getState().user.feedPosts[post.id].likes.filter((like) => like !== store.getState().user.currentUser._id)
        : [];

    try {
        if (store.getState().user.feedPosts[post.id] && store.getState().user.feedPosts[post.id].likes.includes(store.getState().user.currentUser._id)) {
            await updateDoc(postRef, { likes: newLikes });
            return { success: true, post: post, likes: newLikes };
        } else {
            // else add like
            newLikes.push(store.getState().user.currentUser._id);
            await updateDoc(postRef, { likes: newLikes });
            return { success: true, post: post, likes: newLikes };
        }     
    } catch (error) {
        console.log(error);
        return { success: false, error: error.message };
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: null,
        users: {},
        currentUserPosts: [],
        feedPosts: [],
        comments : {},
        likes : {},
        userLikes : {}
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
        setLikes: (state, action) => {
            state.likes = action.payload;
        },
        setUserLikes: (state, action) => {
            state.userLikes = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addComment.fulfilled, (state, action) => {
            // if success is true, add the comment to the comments array
            if (action.payload.success) {
                // the beginning of the array is the newest comment
                state.comments[action.payload.postId].unshift(action.payload.comment);
            }else{
                console.log("error adding comment: ", action.payload.error);
            }
        });
        builder.addCase(likeControl.fulfilled, (state, action) => {
            // if success is true, add the comment to the comments array
            if (action.payload.success) {
                // update the user likes array
                state.likes[action.payload.postId] = action.payload.likes;
                state.userLikes[action.payload.postId] = !state.userLikes[action.payload.postId];
            }else{
                console.log("error adding comment: ", action.payload.error);
            }
        });
    }
});

export const { setCurrentUser, setUsers, setCurrentUserPosts, setFeedPosts, setComments, setLikes, setUserLikes } = userSlice.actions;

export default userSlice.reducer;
