import React, { useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import FeedPostItem from "./FeedPostItem"; 

import { createStackNavigator } from "@react-navigation/stack";
import CommentsScreen from "./Comments";
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../redux/refreshSlice";
import { fetchCurrentUser } from "../helper/user";
import { fetchFeedPosts} from "../helper/posts";
import { FlatList } from "react-native-gesture-handler";

const FeedScreen = ({ navigation }) => {
  const Stack = createStackNavigator();
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.user.feedPosts);
  const refresh = useSelector((state) => state.refresh.refresh);
  const user = useSelector((state) => state.user.currentUser);

  const chargeData = async () => {
    console.log("Charging data");
    dispatch(fetchCurrentUser());
    dispatch (fetchFeedPosts());
  };

  useEffect(() => {
    chargeData();
  }, [user]);

  useEffect(() => {
    if (refresh) {
      chargeData();
      dispatch(toggle());
    }
  }, [refresh]);


  const PostScreen = React.memo(({ navigation }) => {
    return (
      <>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Feed</Text>
            <Text style={styles.headerUser}>
              {user ? user.pseudo : "Loading..."}
            </Text>
          </View>
        <FlatList
          data={posts}
          renderItem={({ item, index }) =>  ( <FeedPostItem post={item} index={index} navigation={navigation} />)}
          keyExtractor={(item) => item._id}
        />
      </>
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

});

export default FeedScreen;
