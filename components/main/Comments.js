// page to display comments using the props post passed from the parent component
import React from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import * as Icon from 'react-native-feather';
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../redux/refreshSlice";
import { addComment } from "../helper/posts";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { Alert } from "react-native";
import { deleteComment } from "../helper/posts";
import DialogButton from 'react-native-dialog/lib/Button';
import { updateComment } from '../helper/posts';

const CommentsScreen = ({ route , navigation }) => {
    const { post } = route.params;
    const [comment, setComment] = useState('');
    const [commentEdit, setCommentEdit] = useState('');
    const comments = useSelector((state) => state.user.comments[post.id]);
    const dispatch = useDispatch();
    const users = useSelector((state) => state.user.users);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const currentUser = useSelector((state) => state.user.currentUser);
    const [indexEdit, setIndexEdit] = useState();



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

    const handleComment = async () => {

        if(buttonDisabled) return;

        setButtonDisabled(true);

        if (comment === '') {
            return alert('Please enter a comment');
        }
        dispatch(addComment({ post: post, comment: comment }));
        dispatch(toggle());
        setComment('');

    }


    const toggleOptions = (comment, index) => {

        if(currentUser._id === comment.userId) {
            return(
            <Menu>
                <MenuTrigger>
                    <SimpleLineIcons name="options-vertical" size={15} color={"black"} />
                </MenuTrigger>

                <MenuOptions>
                <MenuOption onSelect={() => handleDeleteComment(comment)} text="Delete comment" />
                <MenuOption
                    onSelect={() => {

                        setIndexEdit(index);
                        setCommentEdit(comment.comment);
                    
                    }}
                    text="Edit comment"
                />
                </MenuOptions>
          </Menu>
            )
        }
    }

    const handleDeleteComment = (comment) => {
        Alert.alert(
          "Delete Comment",
          "Are you sure you want to delete this comment '" + comment.comment + "'?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () =>
                dispatch(deleteComment({ post: post, comment: comment })),
            },
          ]
        );
      };


    const handleUpdateComment = async (comment) => {

            
            if(buttonDisabled) return;
    
            setButtonDisabled(true);
    
            if (comment === '') {
                return alert('Please enter a comment');
            }

            const newComment = {...comment, comment: commentEdit}

            dispatch(updateComment({ post: post, comment: newComment }));
            dispatch(toggle());
    
        }


    useEffect(() => {
        setButtonDisabled(false);
        setIndexEdit();
    }, [comments]);



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
                renderItem={({ item, index }) => (
                    <View style={styles.commentContainer}>
                        <Image
                            style={styles.profileImage}
                            source={{
                                uri: users[item.userId]?.photo
                            }}
                        />
                        {indexEdit == index ? (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.editContainer}
                                    value={commentEdit}
                                    onChangeText={(text) => setCommentEdit(text)}
                                    textAlignVertical="top"
                                    onSubmitEditing={() => handleUpdateComment(item)}
                                    multiline
                                    autoFocus
                                    cursorColor={'black'}
                                />
                                <TouchableOpacity style={styles.editButton} onPress={ async () => handleUpdateComment(item)} disabled={buttonDisabled}>
                                    <Text style={styles.editText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (  <View style={styles.commentContent}>
                            <Text style={styles.commentText}>{item.comment}</Text>
                            <Text style={styles.commentUsername}>{users[item.userId]?.name} <Text style={styles.commentTime}>{timeAgo(item.date)}</Text></Text>
                        </View>)}
                      
                        <View>
                            {toggleOptions(item, index)}
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.date.toString()}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a comment..."
                    value={comment}
                    onChangeText={(text) => setComment(text)}
                    onSubmitEditing={() => handleComment()}
                />
                <TouchableOpacity style={styles.postButton} onPress={ async () => handleComment()} disabled={buttonDisabled}>
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
        flex: 1,
    },
    commentText: {
        fontSize: 16,
        flexWrap: 'wrap',
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

    editContainer: {
        
        flexDirection: 'row',
        height: Dimensions.get('window').height * 0.05,
        width: Dimensions.get('window').width * 0.52,
        fontSize: 16,

    
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

    editButton: {
        
        height: Dimensions.get('window').height * 0.04,
        width: Dimensions.get('window').width * 0.15,
        marginLeft: Dimensions.get('window').width * 0.02,
        marginRight: Dimensions.get('window').width * 0.046,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },

    editText: {
        color: '#318bfb',
        fontSize: 14,
    }
});
