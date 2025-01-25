import { configureStore } from '@reduxjs/toolkit';
import paramReducer from './slices/paramSlice';
import audioHistoryReducer from './slices/audioHistorySlice';

export const store = configureStore({
  reducer: {
    voices: paramReducer, 
    audioHistory: audioHistoryReducer,
  },
});

export default store;