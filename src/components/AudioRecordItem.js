import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faDownload } from '@fortawesome/free-solid-svg-icons';
import download from 'downloadjs';
import { getAudioById } from '../api/dbService';
import './AudioRecordItem.css';
import { downloadAudio } from '../api/audioStorage';

export default function AudioRecordItem({ recordId, onPlay }) {
    const MAX_CHARS = process.env.REACT_APP_MAX_AUDIO_TEXT_CHARS || 50;
    const [shortText, setShortText] = useState('');
    const [audioPath, setAudioPath] = useState(null);

    useEffect(() => {
        const getText = async () => {
            try {
                const record = await getAudioById(recordId);
                const shortText = (record.text && record.text.length > MAX_CHARS)
                ? `${record.text.slice(0, MAX_CHARS)}...`
                : record?.text || '';
                setShortText(shortText);
                setAudioPath(record.audioPath);
            } catch (error) {
                console.error('Error fetching audio record:', error);
                return null;
            }
        };
        getText();
    }, [recordId]);

    const handleDownload = async () => {
        try {
            const response = await downloadAudio(audioPath);
            const blob = response.body;
            download(blob, `${shortText}.mp3`);
        } catch (error) {
            console.error('Error downloading audio:', error);
        }
    };

    return (
        <div className="audio-record-item">
            <p className="audio-record-title">{shortText}</p>
            <div className="audio-record-actions">
                <button onClick={() => onPlay(recordId)}>
                    <FontAwesomeIcon icon={faCirclePlay} />
                </button>
                <button onClick={handleDownload}>
                    <FontAwesomeIcon icon={faDownload} />
                </button>
            </div>
        </div>
    );
}