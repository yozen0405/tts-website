import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { downloadAudio } from '../api/apiActions';
import download from 'downloadjs';
import ReactH5AudioPlayer from 'react-h5-audio-player'; 
import 'react-h5-audio-player/lib/styles.css';
import './AudioRecordItem.css';
import ConfirmationModal from './ConfirmationModal';
import { RotatingLines } from 'react-loader-spinner';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function AudioRecordItem({ 
    record, 
    onDelete, 
    expanded = true, 
    toggleExpansion = null,
    refreshUrl
}) {
    const { isDeleting } = useSelector((state) => state.audioHistory);

    const MAX_CHARS = process.env.REACT_APP_MAX_AUDIO_TEXT_CHARS || 50;

    const [isDownloading, setIsDownloading] = useState(false);
    const [isCurrentItemDeleting, setisCurrentItemDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const base64Audio = await downloadAudio(record.createdAt);

            // 解碼 Base64 為二進制數據
            const binaryData = atob(base64Audio);
            const byteArray = Uint8Array.from(binaryData, char => char.charCodeAt(0));
            const blob = new Blob([byteArray], { type: "audio/mp3" });

            download(blob, `${record.createdAt}.mp3`);
        } catch (error) {
            toast.error('我們系統出了點問題，請聯絡主管');
            console.error('Error downloading audio:', error);
        }
        setIsDownloading(false);
    };

    const truncatedDescription = record.description.length > MAX_CHARS
        ? `${record.description.slice(0, MAX_CHARS)}...`
        : record.description;

    const formattedDate = new Date(record.createdAt).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const handleDelete = () => {
        if (isDeleting && isCurrentItemDeleting) {
            toast.error('正在刪除此音檔，請稍候');
        } else if (isDeleting) {
            toast.error('正在刪除音其他音檔，請稍候再按');
        } else {
            setShowConfirmModal(true);
        }
    };

    const confirmDelete = async () => {
        setisCurrentItemDeleting(true);
        setShowConfirmModal(false);
        if (onDelete) {
            await onDelete(record.createdAt);
        }
        setisCurrentItemDeleting(false);
    };

    const cancelDelete = () => {
        setShowConfirmModal(false);
    };

    const checkUrlExpired = (url) => {
        try {
            const params = new URLSearchParams(new URL(url).search);
            const expiresTimestamp = params.get("Expires");

            if (!expiresTimestamp) {
                console.error("URL does not contain 'Expires' parameter.");
                return false;
            }

            const now = Math.floor(Date.now() / 1000); 
            return now > parseInt(expiresTimestamp, 10); 
        } catch (error) {
            toast.error('我們系統出了點問題，請聯絡主管');
            return false;
        }
    };

    useEffect(() => {
        const handleFocus = () => {
            const expired = checkUrlExpired(record.url);
            if (expired) {
                refreshUrl();
            }
        };
    
        window.addEventListener('focus', handleFocus);
    
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [record.url]);

    const customDownloadButton = (
        <button 
            onClick={handleDownload} 
            className="rhap_button-clear custom-audio-button"
            disabled={isDownloading}
        >
            {isDownloading ? (
                <RotatingLines
                    strokeColor="#2476d4"
                    animationDuration="0.75"
                    width="30"
                    visible={true}
                />
            ) : (
                <FontAwesomeIcon icon={faDownload} />
            )}
        </button>
    );

    const customDeleteButton = (
        <button 
            onClick={handleDelete} 
            className="rhap_button-clear custom-audio-button delete-button"
        >
            {isCurrentItemDeleting ? (
                <RotatingLines
                    strokeColor="#2476d4"
                    animationDuration="0.75"
                    width="30"
                    visible={true}
                />
            ) : (
                <FontAwesomeIcon icon={faTrash} />
            )}
        </button>
    );

    const handleItemClick = () => {
        if (typeof toggleExpansion === 'function') {
          toggleExpansion(record.createdAt);
        }
    };

    return (
        <div className={`audio-record-item ${expanded ? 'expanded' : ''}`} onClick={handleItemClick}>
            <div className='audio-header'>
                <p className="audio-title">{truncatedDescription}</p>
                <p className="audio-date">{formattedDate}</p>
            </div>
            
            {expanded && (
                <ReactH5AudioPlayer
                    src={record.url}
                    autoPlay={false}
                    showJumpControls={false}
                    showDownloadProgress={true}
                    customAdditionalControls={[customDownloadButton]}
                    customVolumeControls={[customDeleteButton]}
                    onCanPlay={() => {
                        if (checkUrlExpired(record.url)) {
                            refreshUrl();
                        }
                    }}
                    onError={refreshUrl}
                    customIcons={{ play: <FontAwesomeIcon icon={faPlay} />, pause: <FontAwesomeIcon icon={faPause} /> }}
                />
            )}

            <ConfirmationModal
                isVisible={showConfirmModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                message="確定要刪除此記錄？"
            />
        </div>
    );
}