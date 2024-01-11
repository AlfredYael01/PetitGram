import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const addComment = createAsyncThunk(
  "user/addComment",
  async ({ post, comment }) => {
    return { success: true, postId: post.id, comment: comment };
  }
);

export const likeControl = createAsyncThunk(
  "user/likeControl",
  async (post) => {
    return { success: true, postId: post.id, likes: post.likes };
  }
);

export const deletePost = createAsyncThunk("user/deletePost", async (post) => {
  return { success: true, postId: post.id };
});

export const deleteComment = createAsyncThunk(
  "user/deleteComment",
  async ({ post, comment }) => {
    return { success: true, postId: post.id, commentId: comment.id };
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId) => {
    return { success: true, userId: userId };
  }
);

export const toggleFollowUser = createAsyncThunk( "user/followUser", async (followData) => {
  const { userId } = followData;
  return { success: true, userId: userId, followed: true };
}
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    users: {},
    currentUserPosts: [],
    feedPosts: [],
    comments: {},
    likes: {},
    userLikes: {},
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setCurrentUserPosts: (state, action) => {
      state.currentUserPosts = action.payload;
    },
    setFeedPosts: (state, action) => {
      state.feedPosts = action.payload;
    },
    setComments: (state, action) => {
      state.comments = action.payload;
    },
    setLikes: (state, action) => {
      state.likes = action.payload;
    },
    setUserLikes: (state, action) => {
      state.userLikes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addComment.fulfilled, (state, action) => {
      // if success is true, add the comment to the comments array
      if (action.payload.success) {
        // the beginning of the array is the newest comment
        state.comments[action.payload.postId].unshift(action.payload.comment);
      } else {
        console.log("error adding comment: ", action.payload.error);
      }
    });
    builder.addCase(likeControl.fulfilled, (state, action) => {
      // if success is true, add the comment to the comments array
      if (action.payload.success) {
        // update the user likes array
        state.likes[action.payload.postId] = action.payload.likes;
        state.userLikes[action.payload.postId] =
          !state.userLikes[action.payload.postId];
      } else {
        console.log("error adding comment: ", action.payload.error);
      }
    });
    builder.addCase(deletePost.fulfilled, (state, action) => {
      // if success is true, add the comment to the comments array
      console.log("delete post: ", action.payload);
      if (action.payload.success) {
        // update the user likes array
        state.feedPosts = state.feedPosts.filter(
          (post) => post.id !== action.payload.postId
        );
      } else {
        console.log("error deleting post: ", action.payload.error);
      }
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      // if success is true, add the comment to the comments array
      console.log("delete comment: ", action.payload);
      if (action.payload.success) {
        // update the user likes array
        state.comments[action.payload.postId] = state.comments[
          action.payload.postId
        ].filter((comment) => comment.id !== action.payload.commentId);
      } else {
        console.log("error deleting comment: ", action.payload.error);
      }
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      // if success is true, add the comment to the comments array
      if (action.payload.success) {
        // update the user likes array
        state.comments = state.comments.filter(
          (comment) => comment.userId !== action.payload.userId
        );
        state.feedPosts = state.feedPosts.filter(
          (post) => post.userId !== action.payload.userId
        );
        state.currentUserPosts = state.currentUserPosts.filter(
          (post) => post.userId !== action.payload.userId
        );
      } else {
        console.log("error deleting user: ", action.payload.error);
      }
    });
    builder.addCase(toggleFollowUser.fulfilled, (state, action) => {
      // if success is true, add the comment to the comments array
      if (action.payload.success) {
        // update the user likes array
        if (action.payload.followed) {
          state.users[action.payload.userId].followers.push(
            state.currentUser._id
          );
          state.currentUser.followed.push(action.payload.userId);
        } else {
          state.users[action.payload.userId].followers = state.users[
            action.payload.userId
          ].followers.filter(
            (follower) => follower !== state.currentUser._id
          );
          state.currentUser.followed = state.currentUser.followed.filter(
            (followed) => followed !== action.payload.userId
          );
        }
      } else {
        console.log("error toggling follow: ", action.payload.error);
      }
    });
  },
});

export const {
  setCurrentUser,
  setUsers,
  setCurrentUserPosts,
  setFeedPosts,
  setComments,
  setLikes,
  setUserLikes,
} = userSlice.actions;

export default userSlice.reducer;
