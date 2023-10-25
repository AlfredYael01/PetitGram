import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

const Feed = () => {
    const auth = getAuth();
    const [posts, setPosts] = useState([]);

    const getPosts = async () => {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const postsCollection = collection(db, "posts");
        const querySnapshot = await getDocs(postsCollection);

        const postsData = [];
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            if (post.userId === userId) {
                postsData.push(post);
            }
        });
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



    return (
        <ScrollView style={styles.container}>
            {posts.map((post) => (
                <View style={styles.imageContainer} key={post._id}>
                    <View style={styles.profileContainer}>
                        <Image source={require('../../assets/Yo.jpg')} style={styles.profileImage} />
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{post.name}</Text>
                            <Text style={styles.dateText}>
                                {post.timestamp} days ago
                            </Text>
                        </View>
                    </View>
                    <Image source={{ uri: post.image }} style={styles.mainImage} />
                    <Text style={styles.comment}>Commentaire de l'image 1</Text>
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
