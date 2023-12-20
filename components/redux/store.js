// store.js
import { configureStore } from '@reduxjs/toolkit';
import refreshReducer from './refreshSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    refresh: refreshReducer,
    user: userReducer,
  },
});

export default store;
