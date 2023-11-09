import React, {useEffect, useState} from "react";
import {Animated, ImageBackground, View, Text, StyleSheet, Image, Dimensions, ScrollView} from "react-native";
import {getAuth} from "firebase/auth";
import {getFirestore, collection, getDocs, onSnapshot, orderBy} from 'firebase/firestore';
import {query, where} from 'firebase/firestore';
import Swiper from 'react-native-swiper';
import {AntDesign} from '@expo/vector-icons';

const Feed = () => {
    const auth = getAuth();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({})
    const [liked, setLiked] = useState(false)
    const [visible, setVisible] = useState(false)
    const [counter, setCounter] = useState(-2)
    const AnimatedIcon = Animated.createAnimatedComponent(AntDesign)
    useEffect(() => {
        if (liked == true) {
            Animated.spring(currentValue, {toValue: 2, friction: 2}).start(() => {
                Animated.spring(currentValue, {toValue: 1}).start(() => setVisible(false))
            })
        }
    }, [liked]);
    const currentValue = new Animated.Value(1)
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
                    return {[post.userId]: userData};
                })();
                userPromises.push(userPromise);
            }
        });

        // Wait for all user data promises to resolve
        const userDataArray = await Promise.all(userPromises);

        // Convert the array of user data objects into a single object
        const usersData = Object.assign({}, ...userDataArray);

        // Merge new user data with existing user data
        const updatedUsers = {...users, ...usersData};

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


    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Feed</Text>
                <Text style={styles.headerUser}>{users[auth.currentUser.uid]?.pseudo}</Text>
            </View>
            {posts.map((post, index) => (
                <View style={styles.imageContainer} key={post._id}>
                    <View style={styles.profileContainer}>
                        <Image source={{uri: String(users[post.userId]?.photo)}} style={styles.profileImage}/>
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

                                <ImageBackground source={{uri: String(image)}} style={styles.mainImage}>
                                    {visible && index == counter &&
                                        <AnimatedIcon
                                            name={"heart"}
                                            size={50}
                                            color={"#fa635c"}
                                            useNativeDriver={true}
                                            style={{
                                                position: "absolute",
                                                top: 150,
                                                left: "40%",
                                                transform: [{scale: currentValue}],
                                            }}
                                        />
                                    }
                                </ImageBackground>
                            </View>
                        ))}
                    </Swiper>
                    <AntDesign name={liked && index == counter ? "heart" : "hearto"} size={30} color={"#fa635c"}
                               onPress={() => {
                                   console.log(index)
                                   console.log(counter)

                                   if (liked == false) {
                                       setVisible(true)
                                   }
                                   setLiked(!liked)
                                   setCounter(index)
                               }}
                               useNativeDriver={true}
                               style={{marginLeft: 5}}
                    />
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
        alignItems: "center",
        justifyContent: "center",
    },
    comment: {
        padding: 10,
    },
    dateText: {
        color: "gray",
    },
});

export default Feed;
