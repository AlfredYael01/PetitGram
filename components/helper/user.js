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
