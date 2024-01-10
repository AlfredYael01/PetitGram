import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { store } from '../redux/store';
import { setCurrentUserPosts , setFeedPosts, setComments, setLikes, setUserLikes} from '../redux/userSlice';
import { getUserById } from './user';

export function fetchUserPosts() {
    return (async (dispatch) => {
        if (!store.getState().user.currentUser) {
            return;
        }
        const userId = store.getState().user.currentUser._id;
        const db = getFirestore();
        const postsCollection = collection(db, "posts");
        const querySnapshot = await getDocs(
            query(postsCollection, where("userId", "==", userId))
        );
        const postsData = [];
        if (!querySnapshot) {
            console.log("No posts");
            return;
        }
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const id = doc.id;
            const temp = { ...post, id: id };
            postsData.push(temp);
        });

        dispatch(setCurrentUserPosts(postsData));

    });
}

export function fetchFeedPosts() {
    return (async (dispatch) => {
        if (!store.getState().user.currentUser) {
            return;
        }
        const userId = store.getState().user.currentUser._id;
        const db = getFirestore();
        const postsCollection = collection(db, "posts");
        const querySnapshot = await getDocs(
            query(postsCollection, orderBy("date", "desc"))
        );
        if (!querySnapshot) {
            console.log("No posts");
            return;
        }
        const postsData = [];
        const likesData = {};
        const userLikesData = {};
        for (const doc of querySnapshot.docs) {
            const post = doc.data();
            if (post.userId !== userId) {
                const id = doc.id;
                const temp = { ...post, id: id };
                // if the id is not already in the state
                if (
                    !store
                        .getState()
                        .user.feedPosts[id]
                ) {
                    if (!store.getState().user.users[post.userId]) {
                        dispatch(getUserById(post.userId));
                    }
                    if (!store.getState().user.comments[id]) {
                        dispatch(fetchCommentsForPost(id));
                    }
                    // change temp.date to a serialized value
                    temp.date = temp.date.toDate().toString();
                    postsData.push(temp);
                    likesData[id] = temp.likes ? temp.likes : [];
                    userLikesData[id] = temp.likes ? temp.likes.includes(store.getState().user.currentUser._id) : false;
                    // remove likes from post
                    delete temp.likes;

                }
            }
        }
        dispatch(setFeedPosts(postsData));
        dispatch(setLikes(likesData));
        dispatch(setUserLikes(userLikesData));
    }
    );
}

export function fetchComments() {
    return (async (dispatch) => {
        const allPosts = { ...store.getState().user.feedPosts, ...store.getState().user.currentUserPosts };
        // get comments form database
        const db = getFirestore();
        for (const post of Object.values(allPosts)) {
            const postId = post.id;
            // if the comments are not already in the state
            if (!store.getState().user.comments[postId]) {
                const commentsCollection = collection(db, "posts", postId, "comments");
                const querySnapshotComments = await getDocs(
                    query(commentsCollection, orderBy("date", "desc"))
                );
                const commentData = [];
                if (!querySnapshotComments.docs || querySnapshotComments.docs.length === 0) {
                    console.log("No comments");
                    continue;
                }
                for (const doc of querySnapshotComments.docs) {
                    const comment = doc.data();
                    const id = doc.id;
                    const temp = { ...comment, id: id };
                    temp.date = temp.date.toDate().toString();
                    commentData.push(temp);
                    dispatch(getUserById(comment.userId));
                }
                dispatch(setComments({ ...store.getState().user.comments, [postId]: commentData }));
            }
        }
    });
}

export const fetchCommentsForPost = (postId) => {
    return async (dispatch) => {
        // get comments form database
        const db = getFirestore();
        const commentsCollection = collection(db, "posts", postId, "comments");
        const querySnapshotComments = await getDocs(
            query(commentsCollection, orderBy("date", "desc"))
        );
        const commentData = [];
        if (!querySnapshotComments.docs || querySnapshotComments.docs.length === 0) {
            console.log("No comments");
            return;
        }
        for (const doc of querySnapshotComments.docs) {
            const comment = doc.data();
            const id = doc.id;
            const temp = { ...comment, id: id };
            temp.date = temp.date.toDate().toString();
            commentData.push(temp);
            dispatch(getUserById(comment.userId));
        }
        dispatch(setComments({ ...store.getState().user.comments, [postId]: commentData }));
        
    };
};

export const addComment = createAsyncThunk('user/addComment', async (commentData, { dispatch, getState }) => {
    const db = getFirestore();
    const { post, comment } = commentData;
    try {
        const commentsCollection = collection(db, 'posts', post.id, 'comments');
        const newCommentData = {
            comment: comment,
            date: new Date(),
            userId:store.getState().user.currentUser._id,
        };

        await addDoc(commentsCollection, newCommentData);  
        newCommentData.date = newCommentData.date.toString();
        return { success: true, postId: post.id, comment: newCommentData };
    } catch (error) {
        // Handle errors or dispatch an error action if needed
        return { success: false, error: error.message };
    }
});

export const likeControl = createAsyncThunk('user/likeControl', async (post) => { 
    const db = getFirestore();
    const postRef = doc(db, "posts", post.id);
    // if user already liked then remove like
    const newLikes = store.getState().user.likes[post.id]
        ? store.getState().user.likes[post.id].filter((like) => like !== store.getState().user.currentUser._id)
        : [];
    try {
        if (store.getState().user.likes[post.id] && store.getState().user.likes[post.id].includes(store.getState().user.currentUser._id)) {
            await updateDoc(postRef, { likes: newLikes });
            return { success: true, postId: post.id, likes: newLikes };
        } else {
            // else add like
            newLikes.push(store.getState().user.currentUser._id);
            await updateDoc(postRef, { likes: newLikes });
            return { success: true, postId: post.id, likes: newLikes };
        }     
    } catch (error) {
        return { success: false, error: error.message };
    }
});





