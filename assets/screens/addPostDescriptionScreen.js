import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Dimensions, Image, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TouchableOpacity } from "react-native-gesture-handler";
import Swiper from "react-native-swiper";

const AddPostDescriptionScreen = ({ route, navigation }) => {
  const [selectedImages, setSelectedImages] = useState(
    route.params.selectedImages
  );
  const [postButtonDisabled, setPostButtonDisabled] = useState(false);
  const [description, setDescription] = useState("");

  const handlePost = async () => {
    // Disable the touchable opacity button
    if (postButtonDisabled) return;
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
    // Go back to the add post screen
    navigation.navigate("Add Post");

    // navigate to the profile screen
    navigation.navigate("Profile");

    // Enable the touchable opacity button
    setPostButtonDisabled(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.swiperContainer}>
          <Swiper
            style={styles.imageSlider}
            loop={false}
          >
            {selectedImages.map((image) => (
              <Image key={image} source={{ uri: image }} style={styles.image} />
            ))}
          </Swiper>
        </View>
        <TextInput
          multiline
          value={description}
          onChangeText={(text) => setDescription(text)}
          style={styles.descriptionInput}
          numberOfLines={5}
          placeholder="Add description"
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => {
            handlePost();
            setDescription("");
          }}
          disabled={postButtonDisabled}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  postButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
    marginHorizontal: 16,
    alignItems: "center",
  },

  postButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  descriptionInput: {
    width: Dimensions.get("window").width * 0.9,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    color: "#333",
    textAlignVertical: "top",
    paddingLeft: Dimensions.get("window").width * 0.02,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight: 20,
    alignSelf: "center", // Center the input in its container
  },

  imageSlider: {
    height: Dimensions.get("window").height * 0.5,
    marginBottom: Dimensions.get("window").height * 0.02,
  },

  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  swiperContainer: {
    height: Dimensions.get("window").height * 0.5,
    marginBottom: Dimensions.get("window").height * 0.02,
  },
});

export default AddPostDescriptionScreen;