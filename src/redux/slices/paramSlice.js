import { createSlice } from '@reduxjs/toolkit';
import voicesData from '../../assets/voices.json';
import { deleteAudioHistory } from '../../api/apiActions'

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
    record: null, 
    isLoading: false, 
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
    setRecord(state, action) {
      state.record = action.payload; 
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setSelectedLanguage, setSelectedVoice, setText, setSpeed, setPitch, setRecord, setIsLoading, setError } = paramSlice.actions;
export default paramSlice.reducer;

export const deleteAudioRecord = (createdAt) => async (dispatch) => {
  try {
      await deleteAudioHistory(createdAt);
      dispatch(setRecord(null));
  } catch (error) {
      dispatch(setError(error.message));
  }
};