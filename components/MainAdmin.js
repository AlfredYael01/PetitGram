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
} from "react-native";
import { getFirestore, collection, getDocs, orderBy } from "firebase/firestore";
import FeedPostItem from "./main/FeedPostItem";
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

  
  return (
    <View>
      <Text>Admin</Text>
    </View>
  );
};

const styles = StyleSheet.create({
 
  
});

export default MainAdmin;
