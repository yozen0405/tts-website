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
    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentAudioOnChange, setcurrentAudioOnChange] = useState(false); 

    useEffect(() => {
        const fetchAudioHistory = async () => {
            try {
                const user = await getCurrentUser();
                const userId = user.userId;

                const records = await getAudioByUid(userId);
                const recordsWithUrls = await getSortedAudio(records);

                setAudioRecords(recordsWithUrls);
            } catch (error) {
                console.error('Error fetching audio history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAudioHistory();
    }, []);

    const handlePlay = (record) => {
        setCurrentRecord(record);
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
                        record={record}
                        onPlay={handlePlay}
                    />
                ))
            ) : (
                <p>目前沒有任何歷史紀錄</p>
            )}
            {currentRecord && <StickyAudioPlayer audioUrl={currentRecord.audioUrl} initialRecord={currentRecord} onChange={currentAudioOnChange} />}
        </div>
    );
}