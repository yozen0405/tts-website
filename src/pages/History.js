import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import './History.css';
import { getAudioByUid, getSortedAudio } from '../api/dbService';
import Loader from '../components/Loader';

export default function History() {
    const [audioRecords, setAudioRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="history-container">
            <h2>歷史紀錄</h2>
            {isLoading ? (
                <Loader /> // Show loader while loading
            ) : audioRecords.length > 0 ? (
                audioRecords.map((record) => (
                    <div key={record.id} className="history-item">
                        <p className='history-container-title'>{record.shortText}</p>
                        <p className='history-container-time'>{record.createdAt}</p>
                        <audio controls>
                            <source src={record.url} type="audio/mpeg" />
                            您的瀏覽器不支援音頻元素。
                        </audio>
                    </div>
                ))
            ) : (
                <p>目前沒有任何歷史紀錄</p>
            )}
        </div>
    );
}