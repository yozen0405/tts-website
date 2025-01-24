import { configureStore } from '@reduxjs/toolkit';
import paramReducer from './slices/paramSlice';

export const store = configureStore({
  reducer: {
    voices: paramReducer, 
  },
});

export default store;