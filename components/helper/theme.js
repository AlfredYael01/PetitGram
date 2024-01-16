import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const initializeTheme = createAsyncThunk(
    'theme/initializeTheme',
    async () => {
      try {
        const theme = await AsyncStorage.getItem('theme');
        if (theme) {
          return theme;
        } else {
          return 'light';
        }
      } catch (error) {
        console.log(error);
      }
    }
  );
  
  export const toggleTheme = createAsyncThunk(
    'theme/toggleTheme',
    async () => {
      try {
        const theme = await AsyncStorage.getItem('theme');
        if (theme) {
          if (theme === 'light') {
            await AsyncStorage.setItem('theme', 'dark');
            return 'dark';
          } else {
            await AsyncStorage.setItem('theme', 'light');
            return 'light';
          }
        } else {
          await AsyncStorage.setItem('theme', 'light');
          return 'light';
        }
      } catch (error) {
        console.log(error);
      }
    }
  );