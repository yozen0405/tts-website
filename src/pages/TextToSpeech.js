import React, { useEffect } from 'react';
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
	deleteAudioRecord,
	setError
} from '../redux/slices/paramSlice';
import {
	resetState
} from '../redux/slices/audioHistorySlice';
import VoiceDropdown from '../components/VoiceDropdown';
import Loader from '../components/Loader';
import AudioRecordItem from '../components/AudioRecordItem';
import { uploadAudio } from '../api/apiActions';
import { toast } from 'react-toastify';

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
		error
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
			const errorBody = JSON.parse(error.response.body); // 從 response 解析 JSON
			console.log("Parsed Error:", errorBody);
			dispatch(setError(errorBody));
			// console.error('Error generating audio:', body);
		} finally {
			dispatch(setIsLoading(false));
		}
	};

	const showErrorToast = (error) => {
		if (error.errorCode === 'INSUFFICIENT_QUOTA') {
			toast.warning(`您的額度只剩下 ${error.details.quotaLimit - error.details.quotaUsed} 個字，請升級`);
		} else if (error.errorCode === 'CHAR_LIMIT_EXCEEDED') {
			toast.warning(`您最多只能打 ${error.details.charLimit} 個字（目前 ${error.details.charCount}個字）`);
		} else if (error.errorCode === 'INTERNAL_SERVER_ERROR') {
			toast.error('系統出現問題，請稍後再試，並聯絡主管');
		} else {
			toast.error('發生未知錯誤，請聯絡主管');
		}
	};

	// 當 error 發生時顯示 toast
	useEffect(() => {
		if (error) {
			console.log(error);
			showErrorToast(error);
			dispatch(setError(null));
		}
	}, [error, dispatch]);

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
