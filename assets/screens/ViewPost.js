import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, FlatList, TextInput, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPosts } from '../../components/helper/posts';
import { likeControl } from '../../components/helper/posts';
import { AntDesign } from '@expo/vector-icons';
import { addComment } from '../../components/helper/posts';
import { toggle } from '../../components/redux/refreshSlice';
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import * as Icon from 'react-native-feather';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';
import { Alert } from "react-native";
import { deletePost } from '../../components/helper/posts';

const ViewPost = ({ route, navigation }) => {
    const { post, profile } = route.params;
    const dispatch = useDispatch();
    const comments = useSelector((state) => state.user.comments[post.id]);
    const likes = useSelector((state) => state.user.likes[post.id]);
    const userLikes = useSelector((state) => state.user.userLikes[post.id]);
    const [comment, setComment] = useState('');
    const users = useSelector((state) => state.user.users);
    const userPost = useSelector((state) => state.user.userPosts[post.id]);
    const [disableButton, setDisableButton] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
        dispatch(fetchUserPosts( post.id ));
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

    function likeSection() {
        return (
            <View style={styles.IconContainer}>
            <AntDesign
            name={userLikes ? "heart" : "hearto"}
            size={30}
            color={userLikes ? "#fa635c" : "#bbbbbb"}
            onPress={() => dispatch(likeControl(post))}
            />
            <Text style={styles.IconText}>{likes ? likes.length : 0}</Text>
            </View>
        );

    }

    function handleComment() {

        setDisableButton(true);

        if (comment === '') {
            return alert('Please enter a comment');
        }
        dispatch(addComment({ post: post, comment: comment }));
        dispatch(toggle());
        setComment('');
    }

    function commentSection() {
        // a list of comments and a text input to add a comment
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.commentInputContainer}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Add a comment..."
                        value={comment}
                        onChangeText={(text) => setComment(text)}
                        onSubmitEditing={handleComment}
                    />
                    <TouchableOpacity onPress={handleComment}>
                        <Icon.Send size={30} color="black" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={comments}
                    style={{ height: screenHeight * 0.1 }}
                    renderItem={({ item }) => (
                        <View style={styles.commentContainer}>
                            <Image
                                source={{ uri: String( users[item.userId]?.photo ) }}
                                style={styles.profileImage}
                            />
                            <View style={styles.comment}>
                                <Text style={styles.commentName}>{users[item.userId]?.name}</Text>
                                <Text>{item.comment}</Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                />
            </View>
        )
    }


    function handlePostMenu(post) {
        // generate a menu for a post
        return (
          <Menu>
            <MenuTrigger>
                <SimpleLineIcons name="options-vertical" size={25} color={"black"} />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => handleDeletePost()} text="Delete Post" />
              <MenuOption
                onSelect={() => console.log("Edit post pressed!")}
                text="Edit post"
              />
            </MenuOptions>
          </Menu>
        );
      }

      const handleDeletePost = () => {
        Alert.alert(
          "Delete Post",
          "Are you sure you want to delete this post?",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              style: "destructive",
              onPress: () => {
                dispatch(deletePost({ post: post }));
                navigation.goBack();
            
                },
            },
          ]
        );
      };

    useEffect(() => {
        setDisableButton(false);
    }, [comments])
    

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer} key={post._id}>
                    <View style={styles.profileContainer}>
                        <Image source={{ uri: String(profile.photo) }} style={styles.profileImage} />
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{profile.name}</Text>
                            <Text style={styles.dateText}>
                                {timeAgo(post.date)}
                            </Text>
                        </View>
                        <View>
                            {handlePostMenu(post)}
                        </View>
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
                    ))
                    }
                </Swiper>
                {likeSection()}
                <View style={styles.bottomScreen}>
                    <Text style={styles.description}>{userPost?.description}</Text>
                    {commentSection()}
                </View>
        </View>
    );
}

export default ViewPost;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
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
        flex: 0.15,
        borderTopWidth: 0.5,
        borderTopColor: "black",

    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        justifyContent: "center",

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
        justifyContent: "start",
        flex: 1,
    },
    name: {
        fontWeight: "bold",
        marginRight: Dimensions.get('window').width * 0.025,
    },
    imageSlider: {
        height: Dimensions.get('window').height * 0.55,
    },
    pagination: {
        top: Dimensions.get('window').height * 0.52,
        backgroundColor: 'orange'
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

    bottomScreen: {
        height: Dimensions.get('window').height * 0.23,
    },

    description: {
        marginLeft: Dimensions.get('window').width * 0.05,        
    },

    IconContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 10,
    },
    IconText: {
        marginLeft: 5,
    },
    commentContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    comment: {
        marginLeft: 10,
        flex: 1,
    },
    commentName: {
        fontWeight: "bold",
    },
    commentInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    commentInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    commentPost: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        marginLeft: 10,
        borderRadius: 5,
        backgroundColor: "#318bfb",
    },

    iconMenu:{
        height: Dimensions.get('window').height * 0.05,
        width:  Dimensions.get('window').width * 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'green'
    }


});
