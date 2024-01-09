import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { store } from '../redux/store';
import { setCurrentUserPosts , setFeedPosts, setComments} from '../redux/userSlice';
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
        for (const doc of querySnapshot.docs) {
            const post = doc.data();
            if (post.userId !== userId) {
                const id = doc.id;
                const temp = { ...post, id: id };
                if (post.userId !== userId) {
                    // if the id is not already in the state
                    if (
                        !store
                            .getState()
                            .user.feedPosts[id]
                    ) {
                        if (!store.getState().user.currentUserPosts[id]) {
                            dispatch(getUserById(post.userId));
                        }
                        // change temp.date to a serialized value
                        temp.date = temp.date.toDate().toString();

                        postsData.push(temp);
                    }
                }
            }
        }
        dispatch(setFeedPosts(postsData));
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
        const querySnapshotComments = getDocs(
            query(commentsCollection, orderBy("date", "desc"))
        );
        const commentData = [];
        if (!querySnapshotComments) {
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
        dispatch(setComments({...store.getState().user.comments, [postId]: commentData}));
    };
};

export const addComment = createAsyncThunk('user/addComment', async (commentData, { dispatch, getState }) => {
    const db = getFirestore();
    const { post, comment } = commentData;
    console.log(" comenting on post: ", post , " with comment: ", comment);
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
        console.log(error);
        return { success: false, error: error.message };
    }
});

export const likeControl = createAsyncThunk('user/likeControl', async (post) => { 
    console.log("liking post: ", post.id);
    const db = getFirestore();
    const postRef = doc(db, "posts", post.id);
    // if user already liked then remove like
    const newLikes = post.likes
        ? post.likes.filter((like) => like !== store.getState().user.currentUser._id)
        : [];
    console.log("new likes: ", newLikes);
    try {
        if (post.likes && post.likes.includes(store.getState().user.currentUser._id)) {
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





