import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, Image, Dimensions, ScrollView, Button, TouchableOpacity, TextInput} from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, onSnapshot, orderBy, addDoc} from 'firebase/firestore';
import { query, where, doc } from 'firebase/firestore';
import Swiper from 'react-native-swiper';

const Feed = () => {
    const auth = getAuth();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({})
    const [comment, setComment] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const getPosts = async () => {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const postsCollection = collection(db, "posts");
        const querySnapshot = await getDocs(query(postsCollection, orderBy("date", "desc")));
        const commentData = [];
        for (const doc of querySnapshot.docs) {
            const commentsCollection = collection(db,"posts", doc.id, "comments");
            const querySnapshotComments = await getDocs(query(commentsCollection, orderBy("date", "desc")));
            for (const docComment of querySnapshotComments.docs) {
                // array of comments for each post
                const comment = docComment.data();
                const id = doc.id;
                const temp = {...comment, id: id};
                commentData.push({ [id]: temp });
            }
        }
        console.log(commentData);
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
                const temp = {...post, comments: commentData.find((comment) => comment[id])?.[id], id: id};
                postsData.push(temp);
            }

            if (!users[post.userId]) {
                // Create a promise to fetch the user data
                const userPromise = (async () => {
                    const userDoc = await getDocs(query(collection(db, "users"), where("_id", "==", post.userId)));
                    const userData = userDoc.docs[0].data();
                    return { [post.userId]: userData };
                })();
                userPromises.push(userPromise);
            }
            const commentUserId = postsData[postsData.length - 1]?.comments?.userId;
            if (commentUserId && !users[commentUserId]) {
                const userPromise2 = (async () => {
                    const userDoc = await getDocs(query(collection(db, "users"), where("_id", "==", commentUserId)));
                    const userData = userDoc.docs[0].data();
                    return { [commentUserId]: userData };
                })();
                userPromises.push(userPromise2);
            }
        });
        //console.log(postsData);

        // Wait for all user data promises to resolve
        const userDataArray = await Promise.all(userPromises);

        // Convert the array of user data objects into a single object
        const usersData = Object.assign({}, ...userDataArray);

        // Merge new user data with existing user data
        const updatedUsers = { ...users, ...usersData };

        setUsers(updatedUsers);
        setPosts(postsData);
    };


    useEffect(() => {
        const db = getFirestore();
        const postsCollection = collection(db, 'posts');
        const unsubscribe = onSnapshot(postsCollection, (querySnapshot) => {
            // When the database changes, re-run getPosts
            getPosts();
        });
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        getPosts();
        setRefreshing(false);
    }, [refreshing]);

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


    const firstComment = (post) => {
        if (!post?.comments) {
            return;
        }
        const comment = post.comments;
        return (
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
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Feed</Text>
                <Text style={styles.headerUser}>{users[auth.currentUser.uid]?.pseudo}</Text>
            </View>
            {posts.map((post) => (
                <View style={styles.imageContainer} key={post._id}>
                    <View style={styles.profileContainer}>
                        <Image source={{ uri: String(users[post.userId]?.photo) }} style={styles.profileImage} />
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{users[post.userId]?.name}</Text>
                            <Text style={styles.dateText}>
                                {timeAgo(post.date)}
                            </Text>
                        </View>
                    </View>
                    <Swiper
                        style={styles.imageSlider}
                        loop={false}
                        paginationStyle={styles.pagination}
                    >
                        {post.images.map((image) => (
                            <View key={image} style={styles.mainImage}>
                                <Image source={{ uri: String(image) }} style={styles.mainImage} />
                            </View>
                        ))}
                    </Swiper>
                    <View>
                        {/* comment button */}
                        <TouchableOpacity
                            style={styles.commentButton}
                            onPress={() => navigation.navigate("Comments", { post: post })}
                        >
                            <Text style={styles.commentButtonText}>See comments</Text>
                        </TouchableOpacity>
                        {/* Separator Line */}
                        <View style={styles.separator} />

                        {/* first comment */}
                        {firstComment(post)}
                        
                        {/* Separator Line */
                        <View style={styles.separator} ></View>}
                        {/* add comment */}
                        <View style={styles.commentAddSection}>
                            <View style={styles.commentTitle}>
                                <Image source={{ uri: String(users[auth.currentUser.uid]?.photo) }} style={styles.commentProfileImage} />
                                <Text style={styles.nameComment}>
                                    {users[auth.currentUser.uid]?.name}
                                </Text>
                            </View>
                            <TextInput
                                style={styles.commentAddText}
                                placeholder="Add a comment..."
                                onChangeText={(text) => setComment(text)}
                                value={comment}
                            />
                            <Button
                                title="Post"
                                onPress={() => {
                                    const db = getFirestore();
                                    const commentsCollection = collection(db, "posts", post.id, "comments");
                                    const commentData = {
                                        comment: comment,
                                        date: new Date(),
                                        userId: auth.currentUser.uid,
                                    };
                                    setComment("");
                                    addDoc(commentsCollection, commentData);
                                    setRefreshing(true);
                                }}
                            />
                        </View>
                    </View> 
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: "black",
    },
    headerTitle: {
        fontWeight: "bold",
        fontSize: 20,
        flex: 1,
    },
    headerUser: {
        color: "gray",
    },
    imageContainer: {
        flex: 1,
        borderTopWidth: 0.5,
        marginBottom: 3,
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
    },
    name: {
        fontWeight: "bold",
    },
    imageSlider: {
        height: Dimensions.get('window').height / 2,
    },
    pagination: {
        bottom: 0,
    },
    mainImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2,
    },
    commentButton: {
        padding: 10,
    },
    commentButtonText: {
        color: "#007AFF",
    },
    separator: {
        borderBottomWidth: 0.5,
        borderBottomColor: "black",
    },
    commentSection: {
        flexDirection: "row",
        padding: 5,
    },
    ImageProfileComment: {
        flexDirection: "row",
        alignItems: "top",
    },
    commentRight: {
        flexDirection: "column",
        alignItems: "flex-start",
        flex: 1,
    },
    commentAddSection: {
        flexDirection: "row",
        padding: 5,
    },
    commentTitle: {
        flexDirection: "row",
        alignItems: "center",
    },
    commentAddText: {
        flex: 1,
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 15,
        padding: 10,
        marginRight: 10,
    },
    nameComment: {
        fontWeight: "bold",
        marginRight: 10,
    },
    commentText: {
        fontWeight: "normal",
        marginRight: 20,
    },
    commentProfileImage: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: 10,
    },
    dateText: {
        color: "gray",
        fontSize: 12,
    },
});

export default Feed;