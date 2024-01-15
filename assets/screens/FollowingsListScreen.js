import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const FollowingsListScreen = ({ route, navigation }) => {
  const [users, setUsers] = useState([]);
  const renderFollowerItem = ({ item }) => (
    <View style={styles.followerContainer}>
      <Image source={{ uri: item.photo }} style={styles.profileImage} />
      <Text style={styles.profileName}>{item.name}</Text>
      <View style={styles.separator} />
    </View>
  );
  const getfollowed = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    console.log("Auth:", userId);
    const db = getFirestore();
    const currentUser = collection(db, "users");
    const docSnapshot = await getDocs(
      query(currentUser, where("_id", "==", userId))
    );

    console.log("Document Snapshot:", docSnapshot.docs[0].data());
    const followedArray = docSnapshot.docs[0].data().followed;
    console.log("Liste des followed:", followedArray);
    const getFollowerData = async (followerId) => {
      const followerDoc = await getDocs(
        query(currentUser, where("_id", "==", followerId))
      );
      console.log(
        `Data for follower ${followerId}:`,
        followerDoc.docs[0].data()
      );

      followerDoc.forEach((doc) => {
        setUsers((users) => [...users, { ...doc.data(), id: followerId }]);
      });
    };
    for (const followerId of followedArray) {
      await getFollowerData(followerId);
    }
  };

  useEffect(() => {
    getfollowed();
  }, []);

  return (
    <View>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SearchUserProfileScreen", { user: item })
            }
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <Image
                source={{ uri: item.photo }} // Replace 'profilePhoto' with the actual property in your user object
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 10,
                }}
              />
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id} // Assuming 'id' is the unique identifier for each user
      />
    </View>
  );
};

const styles = StyleSheet.create({
  followerContainer: {
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
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "gray",
    marginVertical: 5,
  },
});

export default FollowingsListScreen;
