import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { downloadAudio } from '../api/apiActions';
import download from 'downloadjs';
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

    const handlePlayAudio = async () => {
        if (checkUrlExpired(record.url)) {
            toast.info("畫面刷新中，請稍候。", {
                autoClose: 2000
            });
            dispatch(resetHistoryState());
            await dispatch(fetchAudioHistory());
        }
    };

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

            <audio controls onPlay={handlePlayAudio}>
                <source
                    src={record.url}
                    type="audio/mpeg" />
                您的瀏覽器不支援音頻元素。
            </audio>

            <ConfirmationModal
                isVisible={showConfirmModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                message="確定要刪除此記錄？"
            />
        </div>
    );
}