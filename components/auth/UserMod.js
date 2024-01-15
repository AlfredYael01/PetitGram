import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Text,
  TextInput,
  View,
  StyleSheet,
  Image,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { LogBox } from "react-native";
LogBox.ignoreLogs(["is deprecated"]);
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { updateUser, uploadProfilePicture } from "../helper/user";

export default UserMod = ({ navigation }) => {
  const auth = getAuth();
  const dispatch = useDispatch();
  const userId = auth.currentUser.uid;
  const [profile, setProfile] = useState("");
  const [photo, setPhoto] = useState();
  const [pseudo, setPseudo] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [error, setError] = useState("");
  const currentUser = useSelector((state) => state.user.currentUser);


  const getUserInfo = async () => {
    setProfile(currentUser)
    setPhoto(currentUser.photo);
    setPseudo(currentUser.pseudo);
    setName(currentUser.name);
    setDescription(currentUser.description);
  };
  useEffect(() => {
    getUserInfo();
  }, []);
  const imagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      try {
        setPhoto(result.uri);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const uploadPhoto = async (userId) => {
    dispatch(uploadProfilePicture({ photo: photo, userId: userId }));
  };

  const checkForPseudoUniqueness = async () => {
    const db = getFirestore();
    const userRef = collection(db, "users");
    const userQuery = query(userRef, where("pseudo", "==", pseudo));
    const querySnapshot = await getDocs(userQuery);
    if (querySnapshot.size > 0) {
      if (querySnapshot.docs[0].data()._id !== userId) {
        setError("Pseudo already used");
        return true;
      }
    }
    if (pseudo === "" || name === "" || description === "") {
      setError("All fields must be filled");
      return true;
    }
    return false;
  };

  const updateUserInfo = async () => {
    if (await checkForPseudoUniqueness()) {
      return;
    }
    dispatch(
      updateUser({
        pseudo: pseudo,
        name: name,
        description: description,
      })
    );
  };

  return (
    <View style={stylesLog.container}>
      <View style={stylesLog.form}>
        <View style={stylesLog.imagePicker}>
          <Image source={{ uri: photo }} style={stylesLog.image} />
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={imagePicker}
            testID="imagePickerButton"
          >
            <Text style={styles.imagePickerButtonText}>
              Change Profile Picture
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={stylesLog.sectionTitle}>Account Information</Text>
        <TextInput
          style={[stylesLog.textInput]}
          value={profile.email}
          editable={false}
        />

        <Text style={stylesLog.sectionTitle}>Profile Information</Text>
        <TextInput
          style={[stylesLog.textInput]}
          placeholder={pseudo}
          value={pseudo}
          onChangeText={(text) => setPseudo(text)}
        />
        <TextInput
          style={[stylesLog.textInput]}
          placeholder={name}
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          style={[stylesLog.textInput]}
          placeholder={description}
          value={description}
          onChangeText={(text) => setDescription(text)}
        />

        <TextInput
          style={[stylesLog.errorInput]}
          placeholder=""
          value={error ? error : ""}
          editable={false}
        />

        <TouchableOpacity
          style={stylesLog.button}
          onPress={async () => {
            // if photo did not change set photoUrl to photo else wait for photoUrl to be set
            setError("");
            if (photo !== currentUser.photo) {
              uploadPhoto(userId);
            }
            await updateUserInfo();
            navigation.navigate("UserProfileScreen");
          }}
          testID="ModUser"
        >
          <Text style={stylesLog.buttonText}>Modify profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const stylesLog = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: "#3498DB",
    borderRadius: 5,
    padding: 10,
  },
  imagePickerButtonText: {
    color: "#FFFFFF",
  },
  form: {
    width: "80%",
  },
  textInput: {
    height: 40,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    color: "#333",
  },
  errorInput: {
    borderColor: "red",
    color: "lightcoral",
    alignSelf: "center",
  },
  validatedInput: {
    borderColor: "green",
  },
  button: {
    backgroundColor: "#3498DB",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 10,
  },
});
