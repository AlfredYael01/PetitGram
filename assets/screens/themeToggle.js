// ThemeToggle.js
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../components/redux/themeReducer';

const ThemeToggle = ({ navigation }) => {
  const theme = useSelector((state) => state.theme.currentTheme);
  const dispatch = useDispatch();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  // Execute handleToggleTheme every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      handleToggleTheme();
      navigation.navigate('Profile');
    }, [])
  );

    return null;

};

export default ThemeToggle;
