import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  ImageBackground,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Swiper from "react-native-swiper";
import { createStackNavigator } from "@react-navigation/stack";
import CommentsScreen from "./Comments";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../redux/refreshSlice";
import { fetchCurrentUser } from "../helper/user";
import { fetchFeedPosts, fetchComments, likeControl } from "../helper/posts";

const FeedScreen = ({ navigation }) => {
  const [likedPosts, setLikedPosts] = useState({});
  const Stack = createStackNavigator();
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.user.feedPosts);
  const refresh = useSelector((state) => state.refresh.refresh);
  const user = useSelector((state) => state.user.currentUser);
  const users = useSelector((state) => state.user.users);
  const comments = useSelector((state) => state.user.comments);
  const [liked, setLiked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [counter, setCounter] = useState(-2);
  const AnimatedIcon = Animated.createAnimatedComponent(AntDesign);
  const scrollRef = useRef();
  const [scrollPosition, setScrollPosition] = useState(0);
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

  const currentValue = new Animated.Value(1);
  const chargeData = async () => {
    dispatch(fetchCurrentUser());
    dispatch (fetchFeedPosts());
    dispatch(fetchComments());
    posts.forEach((post, index) => {
      if (post.likes && post.likes.includes(user._id)) {
        const newLikedPosts = { ...likedPosts };
        newLikedPosts[index] = true;
        setLikedPosts(newLikedPosts);
      }
    });
  };

  useEffect(() => {
    // When the database changes, re-run chargeData
    chargeData();
  }, [user]);

  useEffect(() => {
    if (refresh) {
      chargeData();
      dispatch(toggle());
    }
  }, [refresh]);

  function timeAgo(timestamp) {
    const now = new Date();
    const pastDate = new Date(timestamp.toDate());
    const timeDifference = now - pastDate;

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days + " day" + (days === 1 ? "" : "s") + " ago";
    } else if (hours > 0) {
      return hours + " hour" + (hours === 1 ? "" : "s") + " ago";
    } else if (minutes > 0) {
      return minutes + " minute" + (minutes === 1 ? "" : "s") + " ago";
    } else {
      return seconds + " second" + (seconds === 1 ? "" : "s") + " ago";
    }
  }

  function postView(post, navigation, index) {
    return (
      <View style={styles.imageContainer} key={post._id}>
        {postHeader(navigation, post)}
        {imagesSwiper(post, index)}
        {iconsSection(index, post, navigation)}
        <View>
          {/* description */}
          {description(post)}
          {/* first comment */}
          {firstComment(post)}
        </View>
      </View>
    );
  }

  function postHeader(navigation, post) {
    return (
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
          />
          <Text style={styles.name}>{users[post.userId]?.name}</Text>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={styles.dateText}>{timeAgo(post.date)}</Text>
        </View>
      </View>
    );
  }

  function imagesSwiper(post, index) {
    return (
      <Swiper
        style={styles.imageSlider}
        loop={false}
        paginationStyle={styles.pagination}
      >
        {post.images.map((image) => (
          <MemoizedImage key={image} image={image} index={index} />
        ))}
      </Swiper>
    );
  }

  const MemoizedImage = React.memo(({ image, index }) => {
    return (
      <View style={styles.mainImage}>
        <ImageBackground
          source={{ uri: String(image), cache: "force-cache" }}
          style={styles.mainImage}
        >
          {visible && index == counter && likedPosts[index] && (
            <AnimatedIcon
              name={"heart"}
              size={50}
              color={"#fa635c"}
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: currentValue }],
              }}
            ></AnimatedIcon>
          )}
        </ImageBackground>
      </View>
    );
  });

  function iconsSection(index, post, navigation) {
    return (
      <View style={styles.IconContainer}>
        <AntDesign
          name={likedPosts[index] ? "heart" : "hearto"}
          size={30}
          color={liked && index == counter ? "#fa635c" : "#bbbbbb"}
          onPress={() => {
            const positionsBefore = scrollPosition;
            // Mise à jour de l'état liked du post spécifique
            const newLikedPosts = { ...likedPosts };
            newLikedPosts[index] = !likedPosts[index];
            setLikedPosts(newLikedPosts);
            setLiked(!liked);
            // Reste de votre logique de like ici
            if (!likedPosts[index]) {
              setCounter(index);
              setVisible(true);
            }
            dispatch(likeControl(post));
          }}
          useNativeDriver={true}
          style={{ marginLeft: 5 }}
        />
        {/* icon for toggoling add comment for a post */}

        <AntDesign
          name="message1"
          size={30}
          color="#bbbbbb"
          onPress={() => {
            navigation.navigate("Comments", { comments: comments[post.id], users: users, post: post });
          }}
          style={{ marginLeft: 10 }}
        />
      </View>
    );
  }

  const description = (post) => {
    if (!post?.description) {
      return;
    }
    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{post.description}</Text>
      </View>
    );
  };

  const firstComment = (post) => {
    if (comments[post.id]?.length === 0) {
      return;
    }
    const comment = comments[post.id][0];
    return (
      <>
        <View style={styles.commentSection}>
          <View style={styles.ImageProfileComment}>
            <Image
              source={{ uri: String(users[comment.userId]?.photo), cache: "only-if-cached" }}
              style={styles.commentProfileImage}
            />
          </View>
          <View style={styles.commentRight}>
            <Text style={styles.nameComment}>
              {post?.comments?.userId ? users[comment.userId].name + " " : ""}
              <Text style={styles.commentText}>{comment.comment}</Text>
            </Text>
            <Text style={styles.dateText}>
              {comment.date ? timeAgo(comment.date) : ""}
            </Text>
          </View>
        </View>
      </>
    );
  };

  useEffect(() => {
    if (scrollPosition > 0) {
      scrollRef.current.scrollTo({ y: scrollPosition, animated: false });
    }
  }, [posts, visible]);

    const handleScroll = (event) => {
        setScrollPosition(
            (event.nativeEvent.layoutMeasurement.height - 130) * counter
          );
    };

  const PostScreen = React.memo(({ navigation }) => {
    return (
      <Animated.ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="always"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Feed</Text>
          <Text style={styles.headerUser}>
            {user ? user.pseudo : "Loading..."}
          </Text>
        </View>
        {posts.map((post, index) => postView(post, navigation, index))}
      </Animated.ScrollView>
    );
  });

  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Feed" component={PostScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
    </Stack.Navigator>
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
    justifyContent: "flex-end",
    flex: 1,
  },
  IconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
  },
  name: {
    fontWeight: "bold",
  },
  imageSlider: {
    height: Dimensions.get("window").height / 2,
  },
  pagination: {
    bottom: 0,
  },
  mainImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  commentButton: {
    alignItems: "center",
    padding: 3,
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
  nameComment: {
    fontWeight: "bold",
    marginRight: 10,
  },
  commentText: {
    fontWeight: "normal",
    marginRight: 20,
  },
  dateText: {
    color: "gray",
    fontSize: 12,
  },
  descriptionContainer: {
    padding: 10,
  },
  descriptionText: {
    fontSize: 15,
  },

  touchable: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default FeedScreen;
