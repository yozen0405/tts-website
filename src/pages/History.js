import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAudioHistory, deleteAudioRecord } from '../redux/slices/audioHistorySlice';
import './History.css';
import { ClipLoader } from "react-spinners";
import AudioRecordItem from '../components/AudioRecordItem'; 

export default function History() {
    const dispatch = useDispatch();
    const { audioRecords, isLoading } = useSelector((state) => state.audioHistory);

    useEffect(() => {
        dispatch(fetchAudioHistory());
    }, [dispatch]);

    const handleDelete = async (createdAt) => {
        await dispatch(deleteAudioRecord(createdAt));
    };

    return (
        <div className="history-container">
            <h2>歷史紀錄</h2>
            {isLoading ? (
                <div className="history-loader">
                    <ClipLoader size={80} color={"#28b571"} />
                    <p className="loading-text">載入資料中，請稍候...</p>
                </div>
            ) : audioRecords.length > 0 ? (
                audioRecords.map((record) => (
                    <AudioRecordItem
                        key={record.createdAt}
                        record={record}
                        onDelete={handleDelete}
                    />
                ))
            ) : (
                <p>目前沒有任何歷史紀錄</p>
            )}
        </div>
    );
}