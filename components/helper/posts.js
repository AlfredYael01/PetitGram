import { getAuth } from 'firebase/auth';
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
        console.log("fetching comments" + store.getState().user.currentUserPosts);
        const allPosts = { ...store.getState().user.feedPosts, ...store.getState().user.currentUserPosts };
        // get comments form database
        const db = getFirestore();
        for (const post of Object.values(allPosts)) {
            const postId = post.id;
            console.log("fetching comments for post" + postId);
            // if the comments are not already in the state
            if (!store.getState().user.comments[postId]) {
                console.log("fetching comments for post" + postId);
                const commentsCollection = collection(db, "posts", postId, "comments");
                const querySnapshotComments = await getDocs(
                    query(commentsCollection, orderBy("date", "desc"))
                );
                const commentData = [];
                if (!querySnapshotComments.docs || querySnapshotComments.docs.length === 0) {
                    console.log("No comments");
                    continue;
                }
                console.log("fetched comments for post" + querySnapshotComments.docs[0].data());
                for (const doc of querySnapshotComments.docs) {
                    const comment = doc.data();
                    const id = doc.id;
                    const temp = { ...comment, id: id };
                    temp.date = temp.date.toDate().toString();
                    console.log("comment" + temp);
                    commentData.push(temp);
                    dispatch(getUserById(comment.userId));
                }
                console.log("setting comments");
                console.log(commentData);
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
}

export const addComment = (post, comment) => {
    return (async (dispatch) => {
        const db = getFirestore();
        const commentsCollection = collection(db, "posts", post.id, "comments");
        const commentData = {
            comment: comment,
            date: new Date(),
            userId: store.getState().user.currentUser._id,
        };
        await addDoc(commentsCollection, commentData);
        dispatch(fetchCommentsForPost(post.id));
    });
}

export const likeControl =  (post) => {
    return (async (dispatch) => {
        const db = getFirestore();
        const postRef = doc(db, "posts", post.id);
        // if user already liked then remove like
        const newLikes = store.getState().user.currentUserPosts[post.id].likes
            ? store.getState().user.currentUserPosts[post.id].likes.filter((like) => like !== store.getState().user.currentUser._id)
            : [];
        if (store.getState().user.currentUserPosts[post.id].likes && store.getState().user.currentUserPosts[post.id].likes.includes(store.getState().user.currentUser._id)) {
            await updateDoc(postRef, { likes: newLikes });
        } else {
            // else add like
            newLikes.push(store.getState().user.currentUser._id);
            await updateDoc(postRef, { likes: newLikes });
        }
        dispatch(
            setCurrentUserPosts({
                ...store.getState().user.currentUserPosts,
                [post.id]: { ...store.getState().user.currentUserPosts[post.id], likes: newLikes },
            })
        );

    });
}





