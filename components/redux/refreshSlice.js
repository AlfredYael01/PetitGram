// refreshSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const refreshSlice = createSlice({
  name: 'refresh',
  initialState: {
    refresh: false,
  },
  reducers: {
    toggle: state => {
      state.refresh = !state.refresh;
    },
  },
});

export const { toggle } = refreshSlice.actions;

export const selectRefresh = state => state.refresh.refresh;

export default refreshSlice.reducer;


