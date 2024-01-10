// PostItem.js

import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import Swiper from "react-native-swiper";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { likeControl } from "../helper/posts";
import { timeAgo } from "./utils"; // assuming you have a file with utility functions

const feedPostItem = ({ post, index, navigation }) => {
  const dispatch = useDispatch();
  const userLikes = useSelector((state) => state.user.userLikes[post.id]); 
  const likes = useSelector((state) => state.user.likes[post.id]); // [userId1, userId2, ...
  const users = useSelector((state) => state.user.users);
  const comments = useSelector((state) => state.user.comments[post.id]);

  const [liked, setLiked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [counter, setCounter] = useState(-2);
  const AnimatedIcon = Animated.createAnimatedComponent(AntDesign);

  const currentValue = new Animated.Value(1);

  useEffect(() => {
    if (liked == true) {
      Animated.spring(currentValue, {
        toValue: 2,
        friction: 2,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(currentValue, {
          toValue: 1,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
        });
      });
    }
  }, [liked]);

  const handleLikePress = () => {
    setLiked(!liked);
    if (!userLikes[post.id]) {
      setCounter(index);
      setVisible(true);
    }
    dispatch(likeControl(post));
  };

  return (
    <View style={styles.imageContainer} key={post._id}>
      {/* post header */}
      <View style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() =>
            navigation.navigate("searchUserProfileScreen", {
              user: users[post.userId],
            })
          }
        >
          <Image
            source={{ uri: String(users[post.userId]?.photo) }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <Text style={styles.name}>{users[post.userId]?.name}</Text>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={styles.dateText}>{timeAgo(post.date)}</Text>
        </View>
      </View>

      {/* images swiper */}
      <Swiper
        style={styles.imageSlider}
        loop={false}
        paginationStyle={styles.pagination}
      >
        {post.images.map((image) => (
          <MemoizedImage key={image} image={image} index={index} postId={post.id} />
        ))}
      </Swiper>

      {/* icons section */}
      <View style={styles.IconContainer}>
        <AntDesign
          name={userLikes[post.id] ? "heart" : "hearto"}
          size={30}
          color={liked && index == counter ? "#fa635c" : "#bbbbbb"}
          onPress={handleLikePress}
          useNativeDriver={true}
          style={{ marginLeft: 5 }}
        />
        {/* number of likes */}
        <Text style={styles.likesCount}>
          {likes[post.id]?.length > 0 ? likes[post.id].length : " "}
        </Text>

        {/* icon for toggling add comment for a post */}
        <AntDesign
          name="message1"
          size={30}
          color="#bbbbbb"
          onPress={() => { navigation.navigate("commentsScreen", { post: post }); }
            }
            style={{ marginLeft: 5 }}
            />
        {/* number of comments */}
        <Text style={styles.commentsCount}>
          {comments[post.id]?.length > 0 ? comments[post.id].length : " "}
        </Text>
        </View>
        {/* caption */}
        <Text style={styles.caption}>{post.caption}</Text>
        {/* add comment */}
        <TouchableOpacity
            onPress={() => navigation.navigate("commentsScreen", { post: post })}
            style={styles.addComment}
        >
            <Text style={styles.addCommentText}>Add a comment...</Text>
        </TouchableOpacity>
        {/* like animation */}
        {visible && (
            <AnimatedIcon
                name="heart"
                size={100}
                color="#fa635c"
                style={[
                    styles.animatedIcon,
                    {
                        transform: [{ scale: currentValue }],
                    },
                ]}
            />
        )}
    </View>
    );
}

const MemoizedImage = React.memo(({ image, index, postId }) => {
    return (
        <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
        />
    );
});


