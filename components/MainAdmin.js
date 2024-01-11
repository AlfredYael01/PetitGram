import Swiper from "react-native-swiper";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';

import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList
} from "react-native";
import { getFirestore, collection, getDocs, orderBy } from "firebase/firestore";
import FeedPostItemAdmin from "../components/main/FeedPostItemAdmin";
import CommentsScreen from "./main/Comments";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeedPosts } from "../components/helper/posts";
import { query, where } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

const MainAdmin = () => {
  //const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.user.feedPosts);

  const auth = getAuth()

  useEffect(() => {
    dispatch(fetchFeedPosts());
  }, []);


  const PostScreen = React.memo(({ navigation }) => {
    return (
      <>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Admin</Text>
            <TouchableOpacity style={styles.signoutButton} onPress={() => {
              const auth = getAuth();
              signOut(auth);
            }}>
              <Text style={{color: "white", fontWeight: "bold"}}>Signout</Text>
            </TouchableOpacity>
        </View>
        <FlatList
          data={posts}
          renderItem={({ item, index }) =>  ( <FeedPostItemAdmin post={item} index={index} navigation={navigation} />)}
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

  signoutButton:{
    height: Dimensions.get("window").height * 0.05,
    width: Dimensions.get("window").width * 0.2,
    backgroundColor: "black",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  }
  
});

export default MainAdmin;
