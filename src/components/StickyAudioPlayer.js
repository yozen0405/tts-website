import { useState, useRef, useEffect } from 'react';
import './StickyAudioPlayer.css';
import AudioControls from './AudioControls'
import { getAudioById } from '../api/dbService';

export default function StickyAudioPlayer({ recordId, onChange = false }) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [trackProgress, setTrackProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const audioRef = useRef(null);
    const intervalRef = useRef(null);

    const getAudioUrl = async () => {
        const record = await getAudioById(recordId);
        return record.audioUrl;
    };

    const onScrub = (value) => {
        // Clear any timers already running
        clearInterval(intervalRef.current);
        audioRef.current.currentTime = value;
        setTrackProgress(audioRef.current.currentTime);
    };

    const onScrubEnd = () => {
        // If not already playing, start
        if (isPlaying) {
            startTimer();
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const startTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            if (audioRef.current.ended) {
                setIsPlaying(false);
                clearInterval(intervalRef.current);
            } else {
                console.log("current time:", audioRef.current.currentTime, duration);
                setTrackProgress(audioRef.current.currentTime);
            }
        }, [100]);
    };

    useEffect(() => {
        // console.log("isPlaying:", isPlaying, "isLoading:", isLoading);
        if (isPlaying && !isLoading) {
            if (audioRef.current.ended) {
                setTrackProgress(0);
            }
            audioRef.current.play();
            startTimer();
        } else if (!isLoading) {
        audioRef.current.pause();
        }
    }, [isPlaying, isLoading]);

    useEffect(() => {
        // Pause and clean up on unmount
        return () => {
            if (audioRef.current) {
                console.log("pause on unmount");
                audioRef.current.pause();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Change song
    useEffect(() => {
        const changeSong = async () => {
            // console.log("Loading in");
            setIsLoading(true);
            setIsPlaying(true);
            const audioUrl = await getAudioUrl();
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
    
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onloadedmetadata = () => {
                setDuration(audioRef.current.duration);
                setTrackProgress(0);
                setIsLoading(false);
                if (isPlaying) {
                    audioRef.current.play();
                    startTimer();
                }
            };
        };
    
        changeSong(); 
    }, [onChange]);


    return (
        <div className="sticky-audio-player">
            <AudioControls isPlaying={isPlaying} onPlayPauseClick={setIsPlaying} />
            <input
                type="range"
                value={trackProgress}
                step="1"
                min="0"
                max={duration ? duration : `${duration}`}
                className="progress"
                onKeyUp={onScrubEnd}
                onMouseUp={onScrubEnd}
                onChange={(e) => onScrub(e.target.value)}
            />
            {/* <div className="time-display">
                {currentTime} / {duration}
            </div> */}
        </div>
    );
}