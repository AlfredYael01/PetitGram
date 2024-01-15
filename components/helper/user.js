import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { store } from "../redux/store";
import { setUsers, setCurrentUser } from "../redux/userSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getUsers = () => {
  return async (dispatch) => {
    const db = getFirestore();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const userDoc = collection(db, "users");
    const userSnapshot = await getDocs(
      query(userDoc, where("_id", "!=", userId))
    );
    const usersTemp = {};
    userSnapshot.forEach((doc) => {
      const user = doc.data();
      user["id"] = doc.id;
      usersTemp[user.id] = user;
    });

    // update state with new users and old users
    dispatch(setUsers({ ...store.getState().user.users, ...usersTemp }));
  };
};

export const getUserById = (userId) => {
  return async (dispatch) => {
    // check if user is already in state
    const state = store.getState();
    if (state.user.users[userId]) {
      return;
    }
    const db = getFirestore();
    const userDoc = collection(db, "users");
    const userSnapshot = await getDocs(
      query(userDoc, where("_id", "==", userId))
    );
    const user = userSnapshot.docs[0].data();
    user["id"] = userSnapshot.docs[0].id;
    // update state with new user
    dispatch(setUsers({ ...store.getState().user.users, [userId]: user }));
  };
};

export const fetchCurrentUser = () => {
  return async (dispatch) => {
    const db = getFirestore();
    const auth = getAuth();
    if (!auth.currentUser) {
      return;
    }
    if (store.getState().user.currentUser) {
      // user is already in state if they are the same as the current user
      if (store.getState().user.currentUser._id === auth.currentUser.uid) {
        return;
      }
    }
    const userDoc = collection(db, "users");
    const userSnapshot = await getDocs(
      query(userDoc, where("_id", "==", auth.currentUser.uid))
    );
    const user = userSnapshot.docs[0].data();
    user["id"] = userSnapshot.docs[0].id;
    // update state with new user
    dispatch(setCurrentUser(user));
  };
};

export const fetchAdminUser = () => {
  return async (dispatch) => {
    const db = getFirestore();
    const auth = getAuth();
    if (!auth.currentUser) {
      return;
    }
    const user = {
      _id: auth.currentUser.uid,
    };
    // update state with new user
    dispatch(setCurrentUser(user));
  };
};

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId) => {
    // logic behind deleting a user
    try {
      // delete user from database
      return { success: true, userId: userId };
    } catch (error) {
      // error deleting user
      return { success: false, error: error };
    }
  }
);

export const toggleFollowUser = createAsyncThunk( "user/followUser", async (followData) => {
  const { userId } = followData;
  const db = getFirestore();
  const currentUser = store.getState().user.currentUser;
  const user = store.getState().user.users[userId];
  const profileRef = collection(db, "users");
  const userRef = collection(db, "users");
  const filteredFollowers = user.followers.filter(
    (follower) => follower !== currentUser._id
  );
  const filteredFollowed = currentUser.followed.filter(
    (followed) => followed !== user._id
  );
  try {
    const userDoc = doc(profileRef, user.id);
    const currentUserDoc = doc(userRef, currentUser.id);
    if (filteredFollowers.length !== user.followers.length) {
      // user is already followed, unfollow them
      await updateDoc(userDoc, { followers: filteredFollowers });
      await updateDoc(currentUserDoc, { followed: filteredFollowed });
      return { success: true, userId: user._id, followed: false };
    } else {
      // user is not followed, follow them
      await updateDoc(userDoc, { followers: [...user.followers, currentUser._id] });
      await updateDoc(currentUserDoc, { followed: [...currentUser.followed, user._id] });
      return { success: true, userId: user._id, followed: true };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (userData) => {
    const { pseudo, name, description } = userData;
    const db = getFirestore();
    const currentUser = store.getState().user.currentUser;
    const userRef = collection(db, "users");
    const userQuery = query(userRef, where("_id", "==", currentUser._id));
    const querySnapshot = await getDocs(userQuery);
    querySnapshot.forEach(async (doc) => {
      const docRef = doc.ref;
      await updateDoc(docRef, {
        pseudo: pseudo,
        name: name,
        description: description
      });
      console.log("User updated");
    });
    return { success: true, pseudo: pseudo, name: name, description: description };
  }
);

export const uploadProfilePicture = createAsyncThunk(
  "user/uploadProfilePicture",
  async ( photoData ) => {
    try {
      const { userId, photo } = photoData;
      const storage = getStorage();
      const imageFileName = "Profile/" + userId + ".jpg";
      const storageRef = ref(storage, imageFileName);
      // if photo exists delete it
      const currentUser = store.getState().user.currentUser;
      const defaultPhoto =
    "https://firebasestorage.googleapis.com/v0/b/petitgram-b48fd.appspot.com/o/Profile%2FuserImage.png?alt=media&token=29660ffe-caba-4fe6-b028-09af3f446b74&_gl=1*i459ow*_ga*NDMzMjcyMjA3LjE2OTU4ODMxMjk.*_ga_CW55HF8NVT*MTY5OTM0NzExOC4xOS4xLjE2OTkzNDcxNzIuNi4wLjA";
      if (currentUser?.photo !== defaultPhoto){
        const imageToDelete = ref(storage, currentUser.photo);
        await deleteObject(imageToDelete);
      }
      const blob = await fetch(photo).then((r) => r.blob());
      const snapshot = await uploadBytes(storageRef, blob);
      console.log("Uploaded a blob or file!" + snapshot);
      const url = await getDownloadURL(storageRef);
      // update the user photo in the database
      const db = getFirestore();
      const userRef = collection(db, "users");
      const userQuery = query(userRef, where("_id", "==", userId));
      const querySnapshot = await getDocs(userQuery);
      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        await updateDoc(docRef, {
          photo: url
        });
        console.log("User updated");
      });
      return { success: true, photo: url };
    }
    catch (error) {
      return { success: false, error: error.message };
    }

  }
);

