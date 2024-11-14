// pages/History.js
import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import './History.css';
import { getAudioByUid, getSortedAudio } from '../api/dbService';
import Loader from '../components/Loader';
import StickyAudioPlayer from '../components/StickyAudioPlayer';
import AudioRecordItem from '../components/AudioRecordItem'; // Import the new component

export default function History() {
    const [audioRecords, setAudioRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentRecordId, setCurrentRecordId] = useState(null);
    const [currentAudioOnChange, setcurrentAudioOnChange] = useState(false); 

    useEffect(() => {
        const fetchAudioHistory = async () => {
            try {
                const user = await getCurrentUser();
                const userId = user.userId;

                const records = await getAudioByUid(userId);
                const sortedRecords = await getSortedAudio(records);

                setAudioRecords(sortedRecords);
            } catch (error) {
                console.error('Error fetching audio history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAudioHistory();
    }, []);

    const handlePlay = (id) => {
        setCurrentRecordId(id);
        setcurrentAudioOnChange(!currentAudioOnChange);
    };

    return (
        <div className="history-container">
            <h2>歷史紀錄</h2>
            {isLoading ? (
                <Loader />
            ) : audioRecords.length > 0 ? (
                audioRecords.map((record) => (
                    <AudioRecordItem
                        key={record.id}
                        recordId={record.id}
                        onPlay={handlePlay}
                    />
                ))
            ) : (
                <p>目前沒有任何歷史紀錄</p>
            )}
            {currentRecordId && <StickyAudioPlayer recordId={currentRecordId} onChange={currentAudioOnChange} />}
        </div>
    );
}