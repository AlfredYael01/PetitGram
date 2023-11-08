import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, onSnapshot, orderBy} from 'firebase/firestore';
import { query, where } from 'firebase/firestore';
import Swiper from 'react-native-swiper';
require('firebase/firestore')

const Feed = () => {
    const auth = getAuth();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({})
    const [refreshing, setRefreshing] = useState(false)
    const [unmutted, setUnmutted] = useState(null)
    const [inViewPort, setInViewPort] = useState(0)

    const getPosts = async () => {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const postsCollection = collection(db, "posts");
        const querySnapshot = await getDocs(query(postsCollection, orderBy("date", "desc")));
    
        const postsData = [];
        const userPromises = [];
        if (!querySnapshot) {
            console.log("No posts");
            return;
        }
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            if (post.userId !== userId) {
                postsData.push(post);
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
    

    useEffect(() => {
        getPosts();
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
        if (props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
            props.feed.sort(function (x, y) {
                return y.creation.toDate() - x.creation.toDate();
            })

            setPosts(props.feed);
            setRefreshing(false)
            for (let i = 0; i < props.feed.length; i++) {
                if (props.feed[i].type == 0) {
                    setUnmutted(i)
                    return;
                }
            }
        }
        props.navigation.setParams({ param: "value" })

    }, [props.usersFollowingLoaded, props.feed])

    const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
        if (changed && changed.length > 0) {
            setInViewPort(changed[0].index);
        }
    })

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
    

    const onLikePress = (userId, postId) => {
        firebase.firestore()
            .collection("users")
            .doc(userId)
            .collection("posts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .set({})
    }
    const onDislikePress = (userId, postId) => {
        firebase.firestore()
            .collection("users")
            .doc(userId)
            .collection("posts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .delete()
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
                            { item.currentUserLike ?
                            (
                                <Button
                                    title = "Dislike"
                                    onPress={() => onDislikePress(item.user.uid , item._id)}>  
                                </Button>
                            )
                            :
                            (
                                <Button
                                    title = "Like"
                                    onPress={() => onLikePress(item.user.uid , item._id)}>  
                                </Button>
                            )
                            }
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
                    <Text style={styles.comment}>Commentaire de la post</Text>
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
        borderTopColor: "black",
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
    comment: {
        padding: 10,
    },
    dateText: {
        color: "gray",
    },
});

export default Feed;
