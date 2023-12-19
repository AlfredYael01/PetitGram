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
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { query, where, doc } from "firebase/firestore";
import Swiper from "react-native-swiper";
import { createStackNavigator } from "@react-navigation/stack";
import CommentsScreen from "./Comments";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../redux/refreshSlice";

const FeedScreen = ({ navigation }) => {
  const [likedPosts, setLikedPosts] = useState({});
  const auth = getAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const Stack = createStackNavigator();
  const dispatch = useDispatch();
  const refresh = useSelector((state) => state.refresh.refresh);
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
  const getPosts = async () => {
    const userId = auth.currentUser.uid;
    const db = getFirestore();
    const postsCollection = collection(db, "posts");
    const querySnapshot = await getDocs(
      query(postsCollection, orderBy("date", "desc"))
    );
    const commentData = {};
    for (const doc of querySnapshot.docs) {
      const commentsCollection = collection(db, "posts", doc.id, "comments");
      const querySnapshotComments = await getDocs(
        query(commentsCollection, orderBy("date", "desc"))
      );
      for (const docComment of querySnapshotComments.docs) {
        // array of comments for each post
        const comment = docComment.data();
        const id = doc.id;
        const temp = { ...comment, id: id };
        commentData[id] = [...(commentData[id] || []), temp];
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
        const temp = { ...post, id: id, comments: commentData[id] };
        postsData.push(temp);
      }

      if (!users[post.userId]) {
        // Create a promise to fetch the user data
        const userPromise = (async () => {
          const userDoc = await getDocs(
            query(collection(db, "users"), where("_id", "==", post.userId))
          );
          const userData = userDoc.docs[0].data();
          return { [post.userId]: userData };
        })();
        userPromises.push(userPromise);
      }
    });

    // get all users who commented or skip if undefined
    const comments = Object.values(commentData);
    const commentUserIds = comments
      .map((comment) => comment.map((comment) => comment.userId))
      .flat();
    commentUserIds?.forEach((commentUserId) => {
      if (!users[commentUserId]) {
        // Create a promise to fetch the user data
        const userPromise = (async () => {
          const userDoc = await getDocs(
            query(collection(db, "users"), where("_id", "==", commentUserId))
          );
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

    postsData.forEach((post, index) => {
      if (post.likes && post.likes.includes(auth.currentUser.uid)) {
        const newLikedPosts = { ...likedPosts };
        newLikedPosts[index] = true;
        setLikedPosts(newLikedPosts);
      }
    });
  };

  useEffect(() => {
    // When the database changes, re-run getPosts
    getPosts();
  }, []);

  useEffect(() => {
    if (refresh) {
      getPosts();
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
          <View key={image} style={styles.mainImage}>
            <ImageBackground
              source={{ uri: String(image) }}
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
        ))}
      </Swiper>
    );
  }

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
            likeControl(post, positionsBefore);
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
            navigation.navigate("Comments", { post: post, users: users });
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
    if (!post?.comments) {
      return;
    }
    const comment = post.comments.length > 0 ? post.comments[0] : null;
    return (
      <>
        <View style={styles.commentSection}>
          <View style={styles.ImageProfileComment}>
            <Image
              source={{ uri: String(users[comment.userId]?.photo) }}
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

  const likeControl = async (post, positionsBefore) => {
    const db = getFirestore();
    const postRef = doc(db, "posts", post.id);
    // if user already liked then remove like
    const newLikes = post.likes
      ? post.likes.filter((like) => like !== auth.currentUser.uid)
      : [];
    if (post.likes && post.likes.includes(auth.currentUser.uid)) {
      await updateDoc(postRef, { likes: newLikes });
    } else {
      // else add like
      newLikes.push(auth.currentUser.uid);
      await updateDoc(postRef, { likes: newLikes });
    }
    setPosts(
      posts.map((postn) => {
        return postn.id === post.id ? { ...postn, likes: newLikes } : postn;
      })
    );
    // Restore the scroll position
  };

  useEffect(() => {
    console.log(scrollPosition);
    if (scrollPosition > 0) {
      scrollRef.current.scrollTo({ y: scrollPosition, animated: false });
    }
  }, [posts, visible]);

  const PostScreen = ({ navigation }) => {
    return (
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="always"
        ref={scrollRef}
        onScroll={(event) =>
          setScrollPosition(
            (event.nativeEvent.layoutMeasurement.height - 130) * counter
          )
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Feed</Text>
          <Text style={styles.headerUser}>
            {users[auth.currentUser.uid]?.pseudo}
          </Text>
        </View>
        {posts.map((post, index) => postView(post, navigation, index))}
      </ScrollView>
    );
  };

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
