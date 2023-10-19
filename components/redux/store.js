// store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'; // Import your slice(s)

const store = configureStore({
  reducer: {
    user: userReducer, // Add your slices here
    // Add other slices as needed
  },
});

export default store;
