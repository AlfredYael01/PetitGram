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
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../redux/refreshSlice";
import * as ImagePicker from "expo-image-picker";

export default UserMod = ({ navigation }) => {
  const auth = getAuth();
  const dispatch = useDispatch();
  const refresh = useSelector((state) => state.refresh.refresh);
  const defaultPhoto =
    "https://firebasestorage.googleapis.com/v0/b/petitgram-b48fd.appspot.com/o/Profile%2FuserImage.png?alt=media&token=29660ffe-caba-4fe6-b028-09af3f446b74&_gl=1*i459ow*_ga*NDMzMjcyMjA3LjE2OTU4ODMxMjk.*_ga_CW55HF8NVT*MTY5OTM0NzExOC4xOS4xLjE2OTkzNDcxNzIuNi4wLjA";
  const userId = auth.currentUser.uid;
  const [profile, setProfile] = useState("");
  const [photo, setPhoto] = useState();
  const [photoUrl, setPhotoUrl] = useState();
  const [pseudo, setPseudo] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [error, setError] = useState("");
  const [save, setSave] = useState(false);

  const getUserInfo = async () => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "users"));
    //console.log("QuerySnapshot: ",querySnapshot);
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      if (docData._id === userId) {
        setProfile(docData);
        setPhoto(docData.photo);
        setPseudo(docData.pseudo);
        setName(docData.name);
        setDescription(docData.description);
      }
    });
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
      setPhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (userId) => {
    try {
      const storage = getStorage();
      const imageFileName = "Profile/" + userId + ".jpg";
      const storageRef = ref(storage, imageFileName);
      // if photo exists delete it
      if (profile.photo !== defaultPhoto) {
        const imageToDelete = ref(storage, profile.photo);
        await deleteObject(imageToDelete);
      }
      const blob = await fetch(photo).then((r) => r.blob());
      const snapshot = await uploadBytes(storageRef, blob);
      console.log("Uploaded a blob or file!" + snapshot);
      const url = await getDownloadURL(storageRef);
      console.log("url: ", url);
      setPhotoUrl(url);
    } catch (error) {
      setError(error);
    }
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

  const updateUser = async () => {
    if (await checkForPseudoUniqueness()) {
      return;
    }
    //update user in firestore
    const db = getFirestore();
    const userRef = collection(db, "users");
    const userQuery = query(userRef, where("_id", "==", userId));
    const querySnapshot = await getDocs(userQuery);
    querySnapshot.forEach(async (doc) => {
      const docRef = doc.ref;
      updateDoc(docRef, {
        pseudo: pseudo,
        name: name,
        description: description,
        photo: photoUrl,
      });
      console.log("User updated");
      if (refresh == false) {
        dispatch(toggle());
      }
    });
  };

  useEffect(() => {
    if (photoUrl) updateUser();
    if (save == true) {
        setSave(false);
        if (error === "") {
            navigation.goBack();
        }
    }
  }, [photoUrl, save]);

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
            if (photo !== profile.photo) {
              uploadProfilePicture(userId);
            } else {
              setPhotoUrl(photo);
            }
            setSave(true);
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
