// page to display comments using the props post passed from the parent component
import React from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import * as Icon from 'react-native-feather';
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../redux/refreshSlice";
import { addComment } from "../helper/posts";


const CommentsScreen = ({ route , navigation }) => {
    const { post } = route.params;
    const [comment, setComment] = useState('');
    const comments = useSelector((state) => state.user.comments[post.id]);
    const dispatch = useDispatch();
    const refresh = useSelector((state) => state.refresh.refresh);
    const users = useSelector((state) => state.user.users);

    function timeAgo(timestamp) {
        const now = new Date();
        const pastDate = new Date(timestamp);
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
        <View style={styles.container}>
            {/* un route the back button to go back to the previous screen */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon.X style={ styles.backButton } width={24} height={24} color={'#000'}/>
                </TouchableOpacity>
                <Text style={{ fontSize: 16 }}>Comments</Text>
            </View>
            <FlatList
                data={comments}
                renderItem={({ item }) => (
                    <View style={styles.commentContainer}>
                        <Image
                            style={styles.profileImage}
                            source={{
                                uri: users[item.userId]?.photo
                            }}
                        />
                        <View style={styles.commentContent}>
                            <Text style={styles.commentText}>{item.comment}</Text>
                            <Text style={styles.commentUsername}>{users[item.userId]?.name} <Text style={styles.commentTime}>{timeAgo(item.date)}</Text></Text>
                            
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.date.toString()}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a comment..."
                    onChangeText={(text) => setComment(text)}
                />
                <TouchableOpacity style={styles.postButton} onPress={() => {
                                        dispatch(addComment(post, comment));
                                        setComment("");
                                        dispatch(toggle());
                                    }}>
                    <Icon.Send style={styles.postText} width={24} height={24} color={'#fff'} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CommentsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    commentContainer: {
        flexDirection: 'row',
        padding: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    commentContent: {
        marginLeft: 10,
    },
    commentText: {
        fontSize: 16,
    },
    commentUsername: {
        fontSize: 14,
        color: '#666',
    },
    commentTime: {
        color: '#bbb',
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    postButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginLeft: 10,
        borderRadius: 5,
        backgroundColor: '#318bfb',
    },
    postText: {
        color: '#fff',
        fontSize: 16,
    },
    headerContainer: {
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backButton: {
        marginRight: 10,
    },
});
