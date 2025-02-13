import { createSlice } from '@reduxjs/toolkit';
import voicesData from '../../assets/voices.json';
import { deleteAudioHistory, getUserData } from '../../api/apiActions'
import { toast } from 'react-toastify';

const initialState = {
	text: '',
	speed: 0,
	pitch: 0,
	languages: voicesData.languages || [],
	voices: voicesData.voices || [],
	selectedLanguage: voicesData.languages ? voicesData.languages[0] : null, 
	selectedVoice: voicesData.voices
		? voicesData.voices.find(
			(voice) => voice.languageCode === (voicesData.languages[0]?.id || '')
		)
		: null,
	error: null,
	record: null,
	charLimit: 0,
	isGenerating: false,
	isLoading: false,
	loaded: false,
};

const paramSlice = createSlice({
	name: 'paramSlice',
	initialState,
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
		setIsGenerating(state, action) {
			state.isGenerating = action.payload;
		},
		setError(state, action) {
			state.error = action.payload;
		},
		setCharLimit(state, action) {
			state.charLimit = action.payload;
		},
		setLoaded(state, action) {
			state.loaded = action.payload;
		},
		setIsLoading(state, action) {
			state.isLoading = action.payload;
		},
		resetVoiceState() {
			return initialState;
		}
	},
});

export const {
	setSelectedLanguage, 
	setSelectedVoice, 
	setText, setSpeed, 
	setPitch, 
	setRecord, 
	setIsGenerating, 
	setError, 
	setCharLimit,
	setLoaded,
	setIsLoading,
	resetVoiceState
} = paramSlice.actions;

export default paramSlice.reducer;

export const deleteAudioRecord = (createdAt) => async (dispatch) => {
	try {
		await deleteAudioHistory(createdAt);
		dispatch(setRecord(null));
	} catch (error) {
		dispatch(setError(error));
	}
};

export const fetchUserData = () => async (dispatch, getState) => {
	const { loaded } = getState().voices;

	if (loaded) {
		return;
	}

	dispatch(setIsLoading(true));
	try {
		const data = await getUserData();
		dispatch(setCharLimit(data.charLimit));
		dispatch(setLoaded(true));
	} catch (error) {
		console.error("Error fetching user data:", error);
		dispatch(setError(error.message));
	} finally {
		dispatch(setIsLoading(false));
	}
};