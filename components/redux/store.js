// store.js
import { configureStore } from '@reduxjs/toolkit';
import refreshReducer from './refreshSlice';

export const store = configureStore({
  reducer: {
    refresh: refreshReducer,
  },
});

export default store;
