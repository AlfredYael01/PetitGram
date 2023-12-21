import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy} from 'firebase/firestore';
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
        console.log(querySnapshot.docs);
        for (const doc of querySnapshot.docs) {
            const post = doc.data();
            console.log(post);
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
                        temp.date = temp.date.toDate();

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
    return ((dispatch) => {
        console.log("fetching comments" + store.getState().user.currentUserPosts);
        const allPosts = { ...store.getState().user.feedPosts, ...store.getState().user.currentUserPosts };
        // get comments form database
        console.log(allPosts);
        const db = getFirestore();
        const postIds = Object.keys(allPosts);
        for (let i = 0; i < postIds.length; i++) {
            const postId = postIds[i];
            // if the comments are not already in the state
            if (!store.getState().user.comments[postId]) {
                const commentsCollection = collection(db, "posts", postId, "comments");
                const querySnapshotComments = getDocs(
                    query(commentsCollection, orderBy("date", "desc"))
                );
                const commentData = [];
                if (!querySnapshotComments) {
                    console.log("No comments");
                    return;
                }
                querySnapshotComments.forEach((doc) => {
                    const comment = doc.data();
                    const id = doc.id;
                    const temp = { ...comment, id: id };
                    commentData.push(temp);
                    dispatch(getUserById(comment.userId));
                });
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
        querySnapshotComments.forEach((doc) => {
            const comment = doc.data();
            const id = doc.id;
            const temp = { ...comment, id: id };
            commentData.push(temp);
            dispatch(getUserById(comment.userId));
        });
        dispatch(setComments({...store.getState().user.comments, [postId]: commentData}));
    };
}

export const addComment = async (post, comment) => {
    const db = getFirestore();
    const commentsCollection = collection(db, "posts", post.id, "comments");
    const commentData = {
        comment: comment,
        date: new Date(),
        userId: store.getState().user.currentUser._id,
    };
    await addDoc(commentsCollection, commentData);
    dispatch(fetchCommentsForPost(post.id));
}

export const likeControl = async (post) => {
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

}





