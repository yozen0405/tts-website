import { createSlice } from '@reduxjs/toolkit';
import { getAudioHistory, deleteAudioHistory } from '../../api/apiActions';

const initialState = {
    audioRecords: [],
    isLoading: false,
    error: null,
    hasFetched: false, 
};

const audioHistorySlice = createSlice({
    name: 'audioHistory',
    initialState,
    reducers: {
        init(state) {
            state.isLoading = true;
            state.error = null;
        },
        setAudioRecords(state, action) {
            state.isLoading = false;
            state.audioRecords = action.payload;
            state.hasFetched = true; 
        },
        setError(state, action) {
            state.isLoading = false;
            state.error = action.payload;
        },
        deleteRecord(state, action) {
            state.audioRecords = state.audioRecords.filter(
                (record) => record.createdAt !== action.payload
            );
        },
        resetState() {
            return initialState;
        },
    },
});

export const { init, setAudioRecords, setError, resetState, deleteRecord } = audioHistorySlice.actions;

export const fetchAudioHistory = () => async (dispatch, getState) => {
    const { hasFetched } = getState().audioHistory;

    if (hasFetched) {
        return;
    }

    dispatch(init());
    try {
        const records = await getAudioHistory();
        dispatch(setAudioRecords(records));
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const deleteAudioRecord = (createdAt) => async (dispatch) => {
    try {
        await deleteAudioHistory(createdAt);
        dispatch(deleteRecord(createdAt));
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export default audioHistorySlice.reducer;