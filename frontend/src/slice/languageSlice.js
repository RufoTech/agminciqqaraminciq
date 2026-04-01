import { createSlice } from '@reduxjs/toolkit';
import i18n from '../i18n';

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    currentLang: localStorage.getItem('lang') || 'az',
  },
  reducers: {
    setLanguage: (state, action) => {
      state.currentLang = action.payload;
      i18n.changeLanguage(action.payload);
      localStorage.setItem('lang', action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;