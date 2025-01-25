import React from 'react';
import './TextToSpeech.css';
import { useSelector, useDispatch } from 'react-redux';
import {
	setSelectedLanguage,
	setSelectedVoice,
	setText,
	setPitch,
	setSpeed,
	setRecord,
	setIsLoading,
	deleteAudioRecord
} from '../redux/slices/paramSlice';
import {
	resetState
} from '../redux/slices/audioHistorySlice';
import VoiceDropdown from '../components/VoiceDropdown';
import Loader from '../components/Loader';
import AudioRecordItem from '../components/AudioRecordItem';
import { uploadAudio } from '../api/apiActions';

export default function TextToSpeech() {
	const dispatch = useDispatch();
	const {
		languages,
		voices,
		selectedLanguage,
		selectedVoice,
		text,
		speed,
		pitch,
		record,
    	isLoading,
	} = useSelector((state) => state.voices);

	const formatToAzureValue = (value) => {
		const formatted = value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
		return formatted;
	};

	const handleGenerateAudio = async () => {
		if (!text || !selectedVoice || isLoading) return;

		dispatch(setIsLoading(true));
    	dispatch(setRecord(null));

		try {
			const formattedSpeed = formatToAzureValue(speed);
			const formattedPitch = formatToAzureValue(pitch);

			const record = await uploadAudio(text, selectedLanguage.id, selectedVoice.id, formattedSpeed, formattedPitch);
			dispatch(setRecord(record));
			dispatch(resetState());
		} catch (error) {
			console.error('Error generating audio:', error);
		} finally {
			dispatch(setIsLoading(false));
		}
	};

	const handleDelete = async (createdAt) => {
		await dispatch(deleteAudioRecord(createdAt));
	};

	return (
		<div className="text-to-speech-container">
			<h2>輸入文字轉語音</h2>

			<div className="textarea-container">
				<textarea
					className="text-to-speech-textarea"
					value={text}
					onChange={(e) => dispatch(setText(e.target.value))}
					placeholder="輸入想轉成語音的文字"
				/>
			</div>

			<div className="text-to-speech-btn-section">
				<div className="text-to-speech-voice-section">
					<VoiceDropdown
						options={languages}
						onSelect={(language) => dispatch(setSelectedLanguage(language))}
						placeholder={selectedLanguage}
					/>
					<VoiceDropdown
						options={voices.filter((voice) => voice.languageCode === selectedLanguage?.id)}
						onSelect={(voice) => dispatch(setSelectedVoice(voice))}
						placeholder={selectedVoice}
					/>
				</div>

				<div className="range-bars">
					<div className="range-bar">
						<label className="range-bar-label">速度: {speed}%</label>
						<input
							type="range"
							min={-40}
							max={100}
							step={1}
							value={speed}
							onChange={(e) => dispatch(setSpeed(Number(e.target.value)))}
							className="range-bar-slider"
						/>
					</div>
					<div className="range-bar">
						<label className="range-bar-label">音調: {pitch}%</label>
						<input
							type="range"
							min={-40}
							max={40}
							step={1}
							value={pitch}
							onChange={(e) => dispatch(setPitch(Number(e.target.value)))}
							className="range-bar-slider"
						/>
					</div>
				</div>

				<button
					className="text-to-speech-button"
					onClick={handleGenerateAudio}
					disabled={!selectedVoice || isLoading}
				>
					{isLoading ? <Loader color="white" size="8px" /> : '生成語音'}
				</button>
			</div>

			{record && (
				<div className="text-to-speech-audio-area">
					<h3>播放生成的語音</h3>
					<AudioRecordItem 
						record={record} 
						onDelete={handleDelete}
					/>
				</div>
			)}
		</div>
	);
}
