import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { downloadAudio } from '../api/apiActions';
import download from 'downloadjs';
import ReactH5AudioPlayer from 'react-h5-audio-player'; 
import 'react-h5-audio-player/lib/styles.css';
import './AudioRecordItem.css';
import ConfirmationModal from './ConfirmationModal';
import { RotatingLines } from 'react-loader-spinner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAudioHistory, resetHistoryState } from '../redux/slices/audioHistorySlice';
import { toast } from 'react-toastify';

export default function AudioRecordItem({ record, onDelete }) {
    const dispatch = useDispatch();
    const { isDeleting } = useSelector((state) => state.audioHistory);

    const MAX_CHARS = process.env.REACT_APP_MAX_AUDIO_TEXT_CHARS || 50;

    const [isDownloading, setIsDownloading] = useState(false);
    const [isCurrentItemDeleting, setisCurrentItemDeleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
            toast.error('我們系統出了點問題，請聯絡主管');
            console.error('Error downloading audio:', error);
        }
        setIsDownloading(false);
    };

    const truncatedDescription = record.description.length > MAX_CHARS
        ? `${record.description.slice(0, MAX_CHARS)}...`
        : record.description;

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

            const now = Math.floor(Date.now() / 1000); // 取得當前時間（秒）
            return now > parseInt(expiresTimestamp, 10); // 若當前時間大於 `Expires`，則過期
        } catch (error) {
            toast.error('我們系統出了點問題，請聯絡主管');
            return false;
        }
    };

    const refreshAudioUrl = async () => {
        toast.info("畫面刷新中，請稍候...", { autoClose: 3000 });
        dispatch(resetHistoryState());
        await dispatch(fetchAudioHistory());
    }

    useEffect(() => {
        const handleFocus = () => {
            const expired = checkUrlExpired(record.url);
            if (expired) {
                refreshAudioUrl();
            }
        };
    
        window.addEventListener('focus', handleFocus);
    
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [record.url]);

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
                    <button onClick={handleDelete} className="delete-button">
                        {isCurrentItemDeleting ? (
                            <RotatingLines
                                strokeColor="#34874c"
                                animationDuration="0.75"
                                width="35"
                                visible={true}
                            />
                        ) : (
                            <FontAwesomeIcon icon={faTrash} />
                        )}
                    </button>
                </div>

            </div>

            <ReactH5AudioPlayer
                src={record.url}
                autoPlay={false}
                showJumpControls={false}
                showDownloadProgress={true}
                customAdditionalControls={[]}  
                customVolumeControls={[]} 
                onCanPlay={() => {
                    if (checkUrlExpired(record.url)) {
                        refreshAudioUrl();
                    }
                }}
                onError={refreshAudioUrl}
            />

            <ConfirmationModal
                isVisible={showConfirmModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                message="確定要刪除此記錄？"
            />
        </div>
    );
}