import { configureStore } from '@reduxjs/toolkit';
import paramReducer from './slices/paramSlice';
import audioHistoryReducer from './slices/audioHistorySlice';
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    voices: paramReducer, 
    audioHistory: audioHistoryReducer,
    profile: userReducer,
  },
});

export default store;