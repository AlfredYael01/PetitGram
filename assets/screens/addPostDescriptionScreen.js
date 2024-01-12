import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Dimensions } from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TouchableOpacity } from "react-native-gesture-handler";

const AddPostDescriptionScreen = ({ route, navigation }) => {
  const [selectedImages, setSelectedImages] = useState(
    route.params.selectedImages
  );
  const [postButtonDisabled, setPostButtonDisabled] = useState(false);
  const [description, setDescription] = useState("");

  const handlePost = async () => {
    // Disable the touchable opacity button
    setPostButtonDisabled(true);

    // Define post info
    const auth = getAuth();
    const user = auth.currentUser.uid;
    const postId = Math.random().toString(36).substring(7);
    const date = new Date();
    const timestamp = date.getTime();
    const imageUrls = [];

    const storage = getStorage();
    try {
      const uploadPromises = selectedImages.map(async (base64Image, i) => {
        // folder name is the user id
        const imageFileName = `${user}/${postId}/${i}.jpg`;
        const imageRef = ref(storage, imageFileName);
        const response = await fetch(base64Image);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        const imageUrl = await getDownloadURL(imageRef);
        imageUrls.push(imageUrl);
      });
      await Promise.all(uploadPromises);
    } catch (error) {
      console.log(error);
      alert("An error occurred when uploading the images.");
      // Enable the touchable opacity button
      setPostButtonDisabled(false);
      return;
    }

    // Upload data to Firestore
    const db = getFirestore();
    const docRef = await addDoc(collection(db, "posts"), {
      _id: postId,
      userId: user,
      images: imageUrls,
      timestamp: timestamp,
      date: date,
      description: description,
    });

    // Clear selected images
    setSelectedImages([]);

    // Enable the touchable opacity button
    setPostButtonDisabled(false);

    // navigate to the profile screen
    navigation.navigate("Profile");
  };

  return (
    <View style={styles.container}>
      <TextInput
        multiline
        value={description}
        onChangeText={(text) => setDescription(text)}
        style={styles.descriptionInput}
        numberOfLines={5}
        placeholder="Add description"
        placeholderTextColor={"gray"}
      />
      <TouchableOpacity
        style={styles.validateTouchable}
        onPress={() => {
          handlePost();
          setDescription("");
        }}
        disabled={postButtonDisabled}
      >
        <Text style={styles.touchableText}>Validate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },

  validateTouchable: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "black",
    borderRadius: 10,
    marginTop: Dimensions.get("window").height * 0.05,
  },

  touchableText: {
    color: "black",
  },

  descriptionInput: {
    width: Dimensions.get("window").width * 0.9,
    //marginLeft: Dimensions.get('window').width * 0.08,
    marginTop: Dimensions.get("window").height * 0.08,
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "black",
    borderWidth: 0.5,
    color: "black",
    textAlignVertical: "top",
    paddingTop: Dimensions.get("window").height * 0.008,
    paddingLeft: Dimensions.get("window").width * 0.02,
  },
});

export default AddPostDescriptionScreen;
