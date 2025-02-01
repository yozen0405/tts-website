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
	setIsGenerating,
	deleteAudioRecord,
	setError,
	fetchUserData,
	resetVoiceState
} from '../redux/slices/paramSlice';
import {
	resetHistoryState
} from '../redux/slices/audioHistorySlice';
import {
	resetUserState
} from '../redux/slices/userSlice';
import VoiceDropdown from '../components/VoiceDropdown';
import Loader from '../components/Loader';
import AudioRecordItem from '../components/AudioRecordItem';
import { uploadAudio } from '../api/apiActions';
import ClipLoader from 'react-spinners/ClipLoader';
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
		isGenerating,
		error,
		isLoading,
		charLimit,
		loaded
	} = useSelector((state) => state.voices);

	useEffect(() => {
		const handleFocus = () => {
			if (!loaded) {
				toast.info("畫面閒置太久，重制頁面中...", { autoClose: 3000 });
			}
			
			dispatch(fetchUserData());
		};
		
		dispatch(fetchUserData());
		window.addEventListener('focus', handleFocus);
	
		return () => {
			window.removeEventListener('focus', handleFocus);
		};
	}, [dispatch]);

	const formatToAzureValue = (value) => {
		const formatted = value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
		return formatted;
	};

	const handleGenerateAudio = async () => {
		if (!text) {
			dispatch(setError({
				errorCode: "TEXT_EMPTY",
			}));
			return;
		}
		if (isGenerating) {
			dispatch(setError({
				errorCode: "IS_LOADING",
			}));
			return;
		}

		dispatch(setIsGenerating(true));
		dispatch(setRecord(null));
		dispatch(setError(null));

		try {
			const formattedSpeed = formatToAzureValue(speed);
			const formattedPitch = formatToAzureValue(pitch);

			const record = await uploadAudio(text, selectedLanguage.id, selectedVoice.id, formattedSpeed, formattedPitch);
			dispatch(setRecord(record));
			dispatch(resetHistoryState());
			dispatch(resetUserState());
		} catch (error) {
			const errorBody = JSON.parse(error.response.body);
			// console.log("Parsed Error:", errorBody);
			dispatch(setError(errorBody));
			// console.error('Error generating audio:', body);
		} finally {
			dispatch(setIsGenerating(false));
		}
	};

	const renderErrorMessage = () => {
		if (!error) return null;

		if (error.errorCode === "INSUFFICIENT_QUOTA") {
			return `您的額度只剩下 ${error.details.quotaLimit - error.details.quotaUsed} 個字，請升級。`;
		} else if (error.errorCode === "CHAR_LIMIT_EXCEEDED") {
			return `您最多只能打 ${error.details.charLimit} 個字（目前 ${error.details.charCount} 個字）。`;
		} else if (error.errorCode === "INTERNAL_SERVER_ERROR") {
			return "系統出現問題，請稍後再試，並聯絡主管。";
		} else if (error.errorCode === "IS_LOADING") {
			return "請稍候，正在生成語音。";
		} else if (error.errorCode === "TEXT_EMPTY") {
			return "輸入文字不得為空，請輸入內容。";
		} else {
			return "發生未知錯誤，請聯絡主管。";
		}
	};

	const handleDelete = async (createdAt) => {
		await dispatch(deleteAudioRecord(createdAt));
		dispatch(resetHistoryState());
	};

	const refreshAudioUrl = async () => {
		if (!record) return;
		toast.info("畫面閒置太久，重制頁面中...", { autoClose: 3000 });
		dispatch(resetVoiceState());
		await dispatch(fetchUserData());
	}

	if (isLoading) {
		return (
			<div className="text-to-speech-container">
				<h2>輸入文字轉語音</h2>
				<div className="tts-loader">
					<ClipLoader size={80} color={"#28b571"} />
					<p className="loading-text">載入資料中，請稍候...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="text-to-speech-container">
			<h2>輸入文字轉語音</h2>

			<div className="textarea-container">
				<textarea
					className="text-to-speech-textarea"
					value={text}
					onChange={(e) => {
						dispatch(setError(null));
						dispatch(setText(e.target.value));
					}}
					placeholder="輸入想轉成語音的文字"
				/>
				<div className="textarea-downrow">
					{error ? (
						<p className="error-message">{renderErrorMessage()}</p>
					) : (
						<div style={{ width: '50%' }} />
					)}
					<p className="char-counter">
						<span
							className={text.length > charLimit ? "exceed-limit" : ""}
						>
						{text.length}
						</span>{" "}
						/ {charLimit} 字
					</p>
				</div>
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
					disabled={!selectedVoice || isGenerating}
				>
					{isGenerating ? <Loader color="white" size="8px" /> : '生成語音'}
				</button>
			</div>

			{record && (
				<div className="text-to-speech-audio-area">
					<h3>播放生成的語音</h3>
					<AudioRecordItem
						record={record}
						onDelete={handleDelete}
						refreshUrl={refreshAudioUrl}
					/>
				</div>
			)}
		</div>
	);
}
