// components/AudioRecordItem.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faDownload } from '@fortawesome/free-solid-svg-icons';
import download from 'downloadjs';
import axios from 'axios';
import './AudioRecordItem.css';

export default function AudioRecordItem({ record, onPlay }) {
    const handleDownload = async () => {
        try {
            const response = await axios.get(record.url, {
                responseType: 'blob',
            });
            const blob = response.data;
            download(blob, `${record.shortText}.mp3`);
        } catch (error) {
            console.error('Error downloading audio:', error);
        }
    };

    return (
        <div className="audio-record-item">
            <p className="audio-record-title">{record.shortText}</p>
            <div className="audio-record-actions">
                <button onClick={() => onPlay(record)}>
                    <FontAwesomeIcon icon={faCirclePlay} />
                </button>
                <button onClick={handleDownload}>
                    <FontAwesomeIcon icon={faDownload} />
                </button>
            </div>
        </div>
    );
}