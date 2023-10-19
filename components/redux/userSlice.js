// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    // Add other user-related actions as needed
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
