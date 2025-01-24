import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import './History.css';
import { getAudioHistory } from '../api/apiActions';
import Loader from '../components/Loader';
import AudioRecordItem from '../components/AudioRecordItem'; 

export default function History() {
    const [audioRecords, setAudioRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAudioHistory = async () => {
            try {
                // const user = await getCurrentUser();
                // const userId = user.userId;

                const records = await getAudioHistory();
                setAudioRecords(records);
            } catch (error) {
                console.error('Error fetching audio history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAudioHistory();
    }, []);

    return (
        <div className="history-container">
            <h2>歷史紀錄</h2>
            {isLoading ? (
                <Loader />
            ) : audioRecords.length > 0 ? (
                audioRecords.map((record) => (
                    <AudioRecordItem
                        key={record.createdAt}
                        record={record}
                    />
                ))
            ) : (
                <p>目前沒有任何歷史紀錄</p>
            )}
        </div>
    );
}