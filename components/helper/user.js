import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { store } from "../redux/store";
import { setUsers, setCurrentUser } from "../redux/userSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getUsers = () => {
  return async (dispatch) => {
    // remove userIds that are already in state
    const state = store.getState();
    // get all userIds from posts and comments states
    const userIds = Object.keys(state.posts.posts).map((postId) => {
      return state.posts.posts[postId].userId;
    });
    Object.keys(state.posts.comments).forEach((postId) => {
      Object.keys(state.posts.comments[postId]).forEach((commentId) => {
        userIds.push(state.posts.comments[postId][commentId].userId);
      });
    });
    // remove duplicates
    const userIdsToFetch = [...new Set(userIds)];
    // remove userIds that are already in state
    userIdsToFetch.forEach((userId) => {
      if (state.user.users[userId]) {
        userIdsToFetch.splice(userIdsToFetch.indexOf(userId), 1);
      }
    });
    if (userIdsToFetch.length === 0) {
      return;
    }
    const db = getFirestore();
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("_id", "in", userIds));
    const userSnapshot = await getDocs(q);
    const usersTemp = userSnapshot.docs.reduce((acc, user) => {
      acc[user.data()._id] = user.data();
      return acc;
    }, {});
    // update state with new users and old users
    dispatch(setUsers({ ...state.user.users, ...usersTemp }));
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
    // update state with new user
    dispatch(setUsers({ ...state.user.users, [userId]: user }));
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
