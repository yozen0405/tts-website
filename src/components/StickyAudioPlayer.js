import { useState, useRef, useEffect } from 'react';
import './StickyAudioPlayer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { updateAudioRecord } from '../api/dbService';

export default function StickyAudioPlayer({ audioUrl, initialRecord, onChange = false }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');
    const [currentAudioUrl, setCurrentAudioUrl] = useState(audioUrl);
    const [record, setRecord] = useState(initialRecord); 
    const audioRef = useRef(null);
    const progressRef = useRef(null);

    const updateUrlIfExpired = async (record) => {
        if (!record) return;
        const updatedRecord = await updateAudioRecord(record);
        if (record.audioUrl != updatedRecord.audioUrl) {
            setCurrentAudioUrl(updatedRecord.audioUrl);
            setRecord(updatedRecord);
            audioRef.current.src = updatedRecord.audioUrl;
            audioRef.current.load();
            audioRef.current.onloadedmetadata = () => {
                setDuration(formatTime(audioRef.current.duration));
            };
        }
    };

    const togglePlayPause = async () => {
        await updateUrlIfExpired(record);
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(error => {
                    setIsPlaying(false);
                });
            }
        }
    };

    const PlayAudio = async (record) => {
        await updateUrlIfExpired(record);
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsPlaying(true)).catch(error => {
                setIsPlaying(false);
                console.log("Abort err");
            });
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleTimeUpdate = () => {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgress((currentTime / duration) * 100);
        setCurrentTime(formatTime(currentTime));
    };

    const handleProgressClick = (e) => {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const duration = audioRef.current.duration;
        audioRef.current.currentTime = (clickX / width) * duration;
        setProgress((clickX / width) * 100);
    };

    const handleProgressDrag = (e) => {
        const rect = progressRef.current.getBoundingClientRect();
        const dragX = e.clientX - rect.left;
        const width = rect.width;
        const duration = audioRef.current.duration;
        const newTime = Math.min(Math.max((dragX / width) * duration, 0), duration);
        audioRef.current.currentTime = newTime;
        setProgress(Math.min(Math.max((dragX / width) * 100, 0), 100));
    };

    useEffect(() => {
        setCurrentAudioUrl(audioUrl);
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('0:00');
        audioRef.current.onloadedmetadata = () => {
            setDuration(formatTime(audioRef.current.duration));
        };
        setRecord(initialRecord);
        PlayAudio(initialRecord);
    }, [initialRecord, onChange]);

    return (
        <div className="sticky-audio-player">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />
            <button onClick={togglePlayPause} className="play-pause-button">
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            <div
                className="progress-bar"
                ref={progressRef}
                onClick={handleProgressClick}
                onMouseDown={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
            >
                <div
                    className="progress"
                    style={{ width: `${progress}%` }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        document.addEventListener("mousemove", handleProgressDrag);
                        document.addEventListener("mouseup", () => {
                            document.removeEventListener("mousemove", handleProgressDrag);
                        }, { once: true });
                    }}
                />
                <div
                    className="progress-knob"
                    style={{ left: `${progress}%` }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        document.addEventListener("mousemove", handleProgressDrag);
                        document.addEventListener("mouseup", () => {
                            document.removeEventListener("mousemove", handleProgressDrag);
                        }, { once: true });
                    }}
                />
            </div>
            <div className="time-display">
                {currentTime} / {duration}
            </div>
        </div>
    );
}