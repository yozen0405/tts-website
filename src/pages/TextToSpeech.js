import { useState, useEffect } from 'react';
import './TextToSpeech.css';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateAudio } from '../api/generateAudio';
import { getAudioUrl, uploadAudio } from '../api/audioStorage';
import { getAudioByUid, removeOldestAudio, saveNewAudio } from '../api/dbService';
import VoiceDropdown from '../components/VoiceDropdown';
import Loader from '../components/Loader';
import StickyAudioPlayer from '../components/StickyAudioPlayer'; 
import AudioRecordItem from '../components/AudioRecordItem'; 
import voicesData from '../assets/voices.json';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [recordId, setRecordId] = useState(null);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [currentAudioOnChange, setcurrentAudioOnChange] = useState(false); 

  const MAX_CHAR_LIMIT = 5000;

  useEffect(() => {
    const defaultLanguage = voicesData.languages[0];
    setSelectedLanguage({ value: defaultLanguage.language, key: defaultLanguage.languageCode });
    setSelectedVoice(defaultLanguage.voices[0]);
  }, []);

  const handleGenerateAudio = async () => {
    if (!text || !selectedVoice || isLoading) {
      return;
    }
    setIsLoading(true);
    setRecordId(null);
    setCurrentRecordId(null);
    try {
      const audioBlob = await generateAudio(text, selectedVoice);
      const audioPath = await uploadAudio(audioBlob);
      const audioSrcUrl = await getAudioUrl(audioPath);

      await manageAudioHistory(audioPath, audioSrcUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const manageAudioHistory = async (path, url) => {
    try {
      const user = await getCurrentUser();
      const userId = user.userId;
      const MAX_AUDIO_RECORDS = process.env.REACT_APP_MAX_AUDIO_RECORDS || 5;

      const audioRecords = await getAudioByUid(userId);
      if (audioRecords.length >= MAX_AUDIO_RECORDS) {
        await removeOldestAudio(audioRecords);
      }
      const record = await saveNewAudio(userId, text, url, path);
      setRecordId(record.id);
    } catch (error) {
      console.error('Error managing audio history:', error);
    }
  };

  const languages = voicesData.languages.map((lang) => ({
    value: lang.language,
    key: lang.languageCode,
  }));

  const voices = selectedLanguage
    ? voicesData.languages.find((lang) => lang.languageCode === selectedLanguage.key)?.voices || []
    : [];

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
  };

  const handlePlay = (id) => {
    setCurrentRecordId(id);
    setIsAudioLoading(true);
    setcurrentAudioOnChange(!currentAudioOnChange);
  };

  return (
    <div className="text-to-speech-container">
      <h2>輸入文字轉語音</h2>
      <div className="textarea-container">
        <textarea
          className="text-to-speech-textarea"
          value={text}
          onChange={handleTextChange}
          placeholder="輸入想轉成語音的文字"
          maxLength={MAX_CHAR_LIMIT}
        />
        <div className="char-counter">{charCount}/{MAX_CHAR_LIMIT}</div>
      </div>
      <div className='text-to-speech-btn-section'>
        <div className='text-to-speech-voice-section'>
          <VoiceDropdown
            options={languages}
            onSelect={(language) => {
              setSelectedLanguage(language);
              const defaultVoice = voicesData.languages.find((lang) => lang.languageCode === language.key)?.voices[0];
              setSelectedVoice(defaultVoice);
            }}
            placeholder={selectedLanguage ? selectedLanguage.value : "選擇語言"}
          />
          <VoiceDropdown
            options={voices.map((voice) => ({ value: `${voice.gender}`, key: voice.name }))}
            onSelect={(voice) => {
              setSelectedVoice({
                languageCode: selectedLanguage.key,
                name: voice.key,
                gender: voice.value,
              });
            }}
            placeholder={selectedVoice ? selectedVoice.gender : "選擇語音"}
            disabled={!selectedLanguage}
          />
        </div>
        
        <button className="text-to-speech-button" onClick={handleGenerateAudio} disabled={!selectedVoice || isLoading}>
          {isLoading ? <Loader color="white" size="8px" /> : "生成語音"}
        </button>
      </div>
        
      {recordId && (
        <div className="text-to-speech-audio-area">
          <h3>播放生成的語音</h3>
          <AudioRecordItem
            recordId={recordId}
            onPlay={handlePlay}
            isAudioLoading={isAudioLoading}
          />
        </div>
      )}

      {currentRecordId && <StickyAudioPlayer recordId={currentRecordId} onChange={currentAudioOnChange} onLoaded={() => { setIsAudioLoading(false); }} />}
    </div>
  );
}