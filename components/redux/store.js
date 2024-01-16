// store.js
import { configureStore } from '@reduxjs/toolkit';
import refreshReducer from './refreshSlice';
import userReducer from './userSlice';
import themeReducer from './themeReducer';

export const store = configureStore({
  reducer: {
    refresh: refreshReducer,
    user: userReducer,
    theme: themeReducer,
  },
});

export default store;
