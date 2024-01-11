import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, } from "react-native";
import FeedPostItemAdmin from "../components/main/FeedPostItemAdmin";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeedPosts } from "../components/helper/posts";
import { getAuth, signOut } from "firebase/auth";
import { fetchAdminUser } from "../components/helper/user";

const MainAdmin = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.user.feedPosts);
  const user = useSelector((state) => state.user.currentUser);
  const auth = getAuth();
  useEffect(() => {
    dispatch(fetchAdminUser());
  }, [auth]);
  useEffect(() => {
    dispatch(fetchFeedPosts());
  }, [user]);

  const PostScreen = React.memo(({ navigation }) => {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin</Text>
          <TouchableOpacity
            style={styles.signoutButton}
            onPress={() => {
              const auth = getAuth();
              signOut(auth);
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Signout</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{ marginBottom: 100 }}
          data={posts}
          renderItem={({ item, index }) => (
            <FeedPostItemAdmin
              post={item}
              index={index}
              navigation={navigation}
            />
          )}
          keyExtractor={(item) => item._id}
        />
      </>
    );
  });

  return (
    <View>
      <PostScreen />
    </View>
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

  signoutButton: {
    height: Dimensions.get("window").height * 0.05,
    width: Dimensions.get("window").width * 0.2,
    backgroundColor: "black",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MainAdmin;
