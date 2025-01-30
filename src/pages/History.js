import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAudioHistory, 
    deleteAudioRecord, 
    setExpandedRecord,
    resetHistoryState
} from '../redux/slices/audioHistorySlice';
import './History.css';
import { ClipLoader } from "react-spinners";
import AudioRecordItem from '../components/AudioRecordItem'; 
import { toast } from 'react-toastify';

export default function History() {
    const dispatch = useDispatch();
    const { audioRecords, isLoading, expandedRecord } = useSelector((state) => state.audioHistory);

    useEffect(() => {
        dispatch(fetchAudioHistory());
    }, [dispatch]);

    const handleDelete = async (createdAt) => {
        await dispatch(deleteAudioRecord(createdAt));
    };

    const handleToggleExpand = (createdAt) => {
        dispatch(setExpandedRecord(createdAt));
    };

    const refreshAudioUrl = async () => {
        toast.info("畫面刷新中，請稍候...", { autoClose: 3000 });
        dispatch(resetHistoryState());
        await dispatch(fetchAudioHistory());
    }

    return (
        <div className="history-container">
            <div className="history-detail-wrapper">
                <h2>歷史紀錄</h2>
                <div className="history-record-wrapper">
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
                                expanded={expandedRecord === record.createdAt}
                                toggleExpansion={handleToggleExpand}
                                refreshUrl={refreshAudioUrl}
                            />
                        ))
                    ) : (
                        <p>目前沒有任何歷史紀錄</p>
                    )}
                </div>
                
            </div>
        </div>
    );
}