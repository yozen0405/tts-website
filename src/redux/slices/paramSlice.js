import { createSlice } from '@reduxjs/toolkit';
import voicesData from '../../assets/voices.json';

const paramSlice = createSlice({
  name: 'paramSlice',
  initialState: {
    text: '',
    speed: 0,
    pitch: 0,
    languages: voicesData.languages || [], 
    voices: voicesData.voices || [], 
    selectedLanguage: voicesData.languages ? voicesData.languages[0] : null, // 確保存在數據
    selectedVoice: voicesData.voices
      ? voicesData.voices.find(
          (voice) => voice.languageCode === (voicesData.languages[0]?.id || '')
        )
      : null,
    error: null,
  },
  reducers: {
    setSelectedLanguage(state, action) {
      state.selectedLanguage = action.payload;
      state.selectedVoice = state.voices.find(
        (voice) => voice.languageCode === action.payload.id
      );
    },
    setSelectedVoice(state, action) {
      state.selectedVoice = action.payload;
    },
    setText(state, action) {
      state.text = action.payload;
    },
    setSpeed(state, action) {
      state.speed = action.payload;
    },
    setPitch(state, action) {
      state.pitch = action.payload;
    },
  },
});

export const { setSelectedLanguage, setSelectedVoice, setText, setSpeed, setPitch } = paramSlice.actions;
export default paramSlice.reducer;