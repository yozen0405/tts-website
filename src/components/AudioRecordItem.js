import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { downloadAudio } from '../api/apiActions';
import download from 'downloadjs';
import './AudioRecordItem.css';
import { RotatingLines } from 'react-loader-spinner';

export default function AudioRecordItem({ record }) {
    const MAX_CHARS = process.env.REACT_APP_MAX_AUDIO_TEXT_CHARS || 50;
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const base64Audio = await downloadAudio(record.createdAt); // 返回 Base64 音檔數據

            // 解碼 Base64 為二進制數據
            const binaryData = atob(base64Audio);
            const byteArray = Uint8Array.from(binaryData, char => char.charCodeAt(0));
            const blob = new Blob([byteArray], { type: "audio/mp3" });
            
            download(blob, `${record.createdAt}.mp3`);
        } catch (error) {
            console.error('Error downloading audio:', error);
        }
        setIsDownloading(false); 
    };

    const truncatedDescription = record.description.length > MAX_CHARS
        ? `${record.description.slice(0, MAX_CHARS)}...`
        : record.description;

    return (
        <div className="audio-record-item">
            <div className='audio-first-row'>
                <p className="audio-record-title">{truncatedDescription}</p>
                <div className="audio-record-actions">
                <button onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? (
                            <RotatingLines
                                strokeColor="#34874c"
                                animationDuration="0.75"
                                width="35"
                                visible={true}
                            />
                        ) : (
                            <FontAwesomeIcon icon={faDownload} />
                        )}
                    </button>
                </div>
                
            </div>
            
            <audio controls>
                <source src={record.url} type="audio/mpeg" />
                您的瀏覽器不支援音頻元素。
            </audio>
        </div>
    );
}