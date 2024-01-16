import {
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import ImageComponent from "../../components/ImageComponent";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  query as queryFirestore,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../../components/helper/user";

const UserProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const theme = useSelector((state) => state.theme.currentTheme);
  const styles = Styles(theme);
  const postsArray = [
    { id: 1, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 2, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 3, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 4, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 5, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 6, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 7, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 8, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 9, images: [require("./GenerationImage/whiteBackground.jpg")] },
    { id: 10, images: [require("./GenerationImage/whiteBackground.jpg")] },
  ];
  const [posts, setPosts] = useState(postsArray);

  const getPosts = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const db = getFirestore();
    // only docs where the user id is equal to the current user id ordered by date
    const querySnapshot = await getDocs(
      queryFirestore(collection(db, "posts"), where("userId", "==", userId))
    );
    // order by date
    const orderedPosts = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }))
      .sort((a, b) => b.date - a.date);
    setPosts(orderedPosts);
  };

  // call getPosts when the component mounts
  useEffect(() => {
    dispatch(fetchCurrentUser());
    const db = getFirestore();
    const query = collection(db, "posts");
    const unsubscribe = onSnapshot(query, (querySnapshot) => {
      // When the database changes, re-run getPosts
      getPosts();
    });
    // Cleanup the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);


  const handleEditProfilePress = () => {
    navigation.navigate("UserMod");
  };
  return (
    <View style={styles.container}>
      {/* --------- Up screen-------------- */}

      <View style={styles.upScreen}>
        <View></View>
        {/* -----Up top----- */}
        <View style={styles.upScreenTop}>
          <View style={styles.upScreenTopLeft}>
            <Image
              source={{ uri: String(currentUser.photo) }}
              style={styles.image}
            ></Image>
            <Text style={[styles.name, { color: theme === "light" ? "black" : "white" }]}>{currentUser.name}</Text>
          </View>

          <View style={styles.upScreenTopRight}>
            {/*      <View>{showFlatList && renderFlatList()}</View> */}
            <View style={styles.section1}>
              <Text style={[styles.numberSection, { color: theme === "light" ? "black" : "white" }]}>{posts.length}</Text>
              <Text style={[styles.textSection, { color: theme === "light" ? "black" : "white" }]}>Publications</Text>
            </View>

            <View style={styles.section2}>
              <TouchableOpacity
                style={{
                  borderRadius: 5,
                  height: 25,
                  width: 125,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => navigation.navigate("FollowersListScreen")}
              >
                <Text style={[styles.numberSection, { color: theme === "light" ? "black" : "white" }]}>
                  {currentUser?.followers?.length ? currentUser.followers.length : 0}
                </Text>
                <Text style={[styles.textSection, { color: theme === "light" ? "black" : "white" }]}>Followers</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section3}>
              <TouchableOpacity
                style={{
                  borderRadius: 5,
                  height: 25,
                  width: 125,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => navigation.navigate("FollowingsListScreen")}
              >
                <Text style={[styles.numberSection, { color: theme === "light" ? "black" : "white" }]}>
                  {currentUser?.followed?.length ? currentUser.followed.length : 0}
                </Text>
                <Text style={[styles.textSection, { color: theme === "light" ? "black" : "white" }]}>Followed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* -----Up middle----- */}
        <View style={styles.upScreenMiddle}>
          <Text style={[styles.description, { color: theme === "light" ? "black" : "white" }]}>{currentUser.description}</Text>
        </View>

        {/* -----Up bottom ----- */}
        <View style={styles.upscreenBottom}>
          <TouchableOpacity
            style={{
              borderColor: theme === "light" ? "black" : "white",
              borderWidth: 0.5,
              borderRadius: 5,
              height: 25,
              width: 125,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleEditProfilePress}
          >
            <Text style={[styles.editProfileText, { color: theme === "light" ? "black" : "white" }]}>Edit profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/*-----Down screen-----*/}
      <View style={styles.downScreen}>
        <FlatList
          style={{ backgroundColor: theme === "light" ? "white" : "black" }}
          numColumns={3}
          data={posts}
          renderItem={({ item }) => (
            <ImageComponent
              post={item}
              navigation={navigation}
              profile={currentUser}
            />
          )}
        />
      </View>
    </View>
  );
};

const Styles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === "light" ? "white" : "black",
  },

  upScreen: {
    flex: 0.4,
  },

  upScreenTop: {
    flexDirection: "row",
    flex: 0.5,
  },

  upScreenTopLeft: {
    flex: 0.35,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  upScreenTopRight: {
    flex: 0.65,
    flexDirection: "row",
  },

  textSection: {
    fontSize: 12,
  },

  numberSection: {
    fontSize: 15,
    fontWeight: "bold",

    marginTop: Dimensions.get("window").height * 0.000001,
  },

  section1: {
    flex: 1 / 3,
    alignItems: "center",
    justifyContent: "center",
  },

  section2: {
    flex: 1 / 3,
    alignItems: "center",
    justifyContent: "center",
  },
  section3: {
    flex: 1 / 3,
    alignItems: "center",
    justifyContent: "center",
  },

  /********************  upscreen Midle     ******************************/

  upScreenMiddle: {
    flex: 0.2,
  },

  name: {
    marginTop: Dimensions.get("window").height * 0.01,
    fontWeight: "bold",
  },

  description: {
    marginTop: Dimensions.get("window").height * 0.015,
    marginLeft: Dimensions.get("window").height * 0.025,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    marginTop: Dimensions.get("window").height * 0.005,
  },

  accountName: {
    fontWeight: "bold",
    marginTop: Dimensions.get("window").height * 0.035,
  },

  /********************  upscreen Bottom     ******************************/

  upscreenBottom: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },

  editProfileText: {
    fontWeight: "bold",
  },

  /********************  down Midle     ******************************/

  touchableMenu: {
    padding: 10,
    marginLeft: Dimensions.get("window").width * 0.6,
    marginTop: Dimensions.get("window").height * 0.035,
  },
  downScreen: {
    flex: 0.6,
  },
});

export default UserProfileScreen;
