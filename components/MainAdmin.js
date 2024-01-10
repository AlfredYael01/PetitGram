import Swiper from 'react-native-swiper';
import React, {useEffect, useState} from "react";
import {ImageBackground, View, Text, StyleSheet, Image, Dimensions, TouchableOpacity} from "react-native";
import {getFirestore, collection, getDocs, orderBy} from 'firebase/firestore';
import {query, where} from 'firebase/firestore';
import {AntDesign} from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

const MainAdmin = () => {

    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({});
    const [visible, setVisible] = useState(false)

    const auth = getAuth();


    const getPosts = async () => {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const postsCollection = collection(db, "posts");
        const querySnapshot = await getDocs(query(postsCollection, orderBy("date", "desc")));
        const commentData = {}
        for (const doc of querySnapshot.docs) {
            const commentsCollection = collection(db,"posts", doc.id, "comments");
            const querySnapshotComments = await getDocs(query(commentsCollection, orderBy("date", "desc")));
            for (const docComment of querySnapshotComments.docs) {
                // array of comments for each post
                const comment = docComment.data();
                const id = doc.id;
                const temp = {...comment, id: id};
                commentData[id] = [...commentData[id] || [], temp ];
            }
        }
        const postsData = [];
        const userPromises = [];
        if (!querySnapshot) {
            console.log("No posts");
            return;
        }
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            if (post.userId !== userId) {
                const id = doc.id;
                const temp = {...post, id: id, comments: commentData[id]};
                postsData.push(temp);
            }

            if (!users[post.userId]) {
                // Create a promise to fetch the user data
                const userPromise = (async () => {
                    const userDoc = await getDocs(query(collection(db, "users"), where("_id", "==", post.userId)));
                    const userData = userDoc.docs[0].data();
                    return {[post.userId]: userData};
                })();
                userPromises.push(userPromise);
            }
        });

        // get all users who commented or skip if undefined
        const comments = Object.values(commentData);
        const commentUserIds = comments.map((comment) => comment.map((comment) => comment.userId)).flat();
        commentUserIds?.forEach((commentUserId) => {
            if (!users[commentUserId]) {
                // Create a promise to fetch the user data
                const userPromise = (async () => {
                    const userDoc = await getDocs(query(collection(db, "users"), where("_id", "==", commentUserId)));
                    const userData = userDoc.docs[0].data();
                    return { [commentUserId]: userData };
                })();
                userPromises.push(userPromise);
            }
        });

        // Wait for all user data promises to resolve
        const userDataArray = await Promise.all(userPromises);

        // Convert the array of user data objects into a single object
        const usersData = Object.assign({}, ...userDataArray);

        // Merge new user data with existing user data
        const updatedUsers = { ...users, ...usersData };

        setUsers(updatedUsers);
        setPosts(postsData);
    };


    function timeAgo(timestamp) {
        const now = new Date();
        const pastDate = new Date(timestamp.toDate());
        const timeDifference = now - pastDate;

        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return days + ' day' + (days === 1 ? '' : 's') + ' ago';
        } else if (hours > 0) {
            return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
        } else if (minutes > 0) {
            return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
        } else {
            return seconds + ' second' + (seconds === 1 ? '' : 's') + ' ago';
        }
    }

    const description = (post) => {
        if (!post?.description) {
            return;
        }
        return (
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                    {post.description}
                </Text>
            </View>
        );
    }

    const firstComment = (post) => {
        if (!post?.comments) {
            return;
        }
        const comment = post.comments.length > 0 ? post.comments[0] : null;
        return (
            <>
                <View style={styles.commentSection}>
                    <View style={styles.ImageProfileComment}>
                        <Image source={{ uri: String(users[comment.userId]?.photo) }} style={styles.commentProfileImage} />
                    </View>
                    <View style={styles.commentRight}>
                        <Text style={styles.nameComment}>
                            {post?.comments?.userId ? users[comment.userId].name + ' ' : ''}
                            <Text style={styles.commentText}>{comment.comment}</Text>
                        </Text>
                        <Text style={styles.dateText}>
                            {comment.date ? timeAgo(comment.date) : ''}
                        </Text>
                    </View>
                </View>
            </>
        );
    }

    useEffect(() => {
        getPosts();

}, []);

    return(
       <View style={styles.container}>
            <Swiper>
            {posts.map((post) => (
                <View style={styles.container} key={post.id}>
                <Text>{post.id}</Text>
                <Swiper>
                    {post.images.map((image) => (
                        <Image source={{uri: String(image)}} style={{width: 500, height: 500}}/>
                    ))}
                </Swiper>
                </View>
            ))}
            </Swiper>
        </View>
    )
}



const styles = StyleSheet.create({
   container: {
    flex: 1
   },

   outerSwiper: {
    backgroundColor: 'yellow',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
   },

   innerSwiper: {
    backgroundColor: 'red',
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').height * 0.7
   }
});


export default MainAdmin;