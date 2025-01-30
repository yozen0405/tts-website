import { createSlice } from '@reduxjs/toolkit';
import { getAudioHistory, deleteAudioHistory } from '../../api/apiActions';
import { toast } from 'react-toastify';

const initialState = {
    audioRecords: [],
    isLoading: false,
    isDeleting: false,
    error: null,
    hasFetched: false, 
    expandedRecord: null,
};

const audioHistorySlice = createSlice({
    name: 'audioHistory',
    initialState,
    reducers: {
        setIsLoading(state, action) {
            state.isLoading = action.payload;
        },
        setAudioRecords(state, action) {
            state.audioRecords = action.payload;
            state.hasFetched = true; 
        },
        setError(state, action) {
            state.isLoading = false;
            state.error = action.payload;
        },
        setIsDeleting(state, action) {
            state.isDeleting = action.payload;
        },
        deleteRecord(state, action) {
            state.audioRecords = state.audioRecords.filter(
                (record) => record.createdAt !== action.payload
            );
        },
        setExpandedRecord(state, action) {
            state.expandedRecord = action.payload;
        },
        resetHistoryState() {
            return initialState;
        },
    },
});

export const { setIsLoading, setAudioRecords, setError, setIsDeleting, setExpandedRecord, resetHistoryState, deleteRecord } = audioHistorySlice.actions;

export const fetchAudioHistory = () => async (dispatch, getState) => {
    const { hasFetched } = getState().audioHistory;

    if (hasFetched) {
        return;
    }

    dispatch(setIsLoading(true));
    try {
        const records = await getAudioHistory();
        dispatch(setAudioRecords(records));
        dispatch(setIsLoading(false));
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const deleteAudioRecord = (createdAt) => async (dispatch, getState) => {
    const { isDeleting } = getState().audioHistory;

    if (isDeleting) {
        return;
    }

    try {
        dispatch(setIsDeleting(true));
        await deleteAudioHistory(createdAt);
        dispatch(deleteRecord(createdAt));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setIsDeleting(false));
    }
    toast.info("刪除成功！", { autoClose: 2000 });
};

export default audioHistorySlice.reducer;