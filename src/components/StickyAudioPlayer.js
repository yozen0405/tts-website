import { useState, useRef, useEffect } from 'react';
import './StickyAudioPlayer.css';
import AudioControls from './AudioControls'
import { getAudioById } from '../api/dbService';

export default function StickyAudioPlayer({ recordId, onChange, onLoaded }) {
    const SCALE_FACTOR = 10000;

    const [isPlaying, setIsPlaying] = useState(true);
    const [trackProgress, setTrackProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const audioRef = useRef(null);
    const intervalRef = useRef(null);
    const currentTime = useRef(0);

    const getAudioUrl = async () => {
        const record = await getAudioById(recordId);
        return record.audioUrl;
    };

    const onScrub = (value) => {    
        console.log("on srub");
        const scaledValue = value / SCALE_FACTOR;
        clearInterval(intervalRef.current);
        audioRef.current.currentTime = scaledValue;
        setTrackProgress(audioRef.current.currentTime * SCALE_FACTOR);
        currentTime.current = audioRef.current.currentTime * SCALE_FACTOR;
    };

    const onScrubEnd = () => {
        console.log("srub end");
        if (!isPlaying) {
            setIsPlaying(true);
        }
        startTimer();
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
                const updatedTime = audioRef.current.currentTime * SCALE_FACTOR;
                if (currentTime.current <= updatedTime) {
                    setTrackProgress(updatedTime);
                    currentTime.current = audioRef.current.currentTime * SCALE_FACTOR;
                    // console.log("currentTime:", currentTime.current);   
                    // console.log("current time: ", intervalRef.current, audioRef.current.currentTime, updatedTime);
                }
            }
        }, 10);
    };

    useEffect(() => {
        if (isPlaying && !isLoading) {
            if (audioRef.current.ended) {
                setTrackProgress(0);
                currentTime.current = 0;
            }
            audioRef.current.play();
            startTimer();
        } else if (!isLoading) {
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        }
    }, [isPlaying, isLoading]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const changeSong = async () => {
            setIsLoading(true);
            setIsPlaying(true);
            // console.log("cnt: ", CntDebugger.current);
            
            const audioUrl = await getAudioUrl();
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
    
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onloadedmetadata = () => {
                // console.log("onloadmeta", onChange);
                setDuration(audioRef.current.duration * SCALE_FACTOR);
                setTrackProgress(0);
                currentTime.current = 0;
                setIsLoading(false);
                if (onLoaded) {
                    onLoaded();
                }
                if (isPlaying) {
                    audioRef.current.play();
                    startTimer();
                }
            };
        };
    
        changeSong(); 
    }, [onChange]);

    const currentPercentage = duration
    ? `${(trackProgress / duration) * 100}%`
    : "0%";

    const trackStyling = `
        -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))
    `;

    return (
        <div className="sticky-audio-player">
            <AudioControls isPlaying={isPlaying} onPlayPauseClick={setIsPlaying} />
            <input
                type="range"
                value={currentTime.current}
                step="1"
                min="0"
                max={duration ? duration : 0}
                className="progress"
                onKeyUp={onScrubEnd}
                onMouseUp={onScrubEnd}
                onTouchEnd={onScrubEnd}
                onChange={(e) => onScrub(e.target.value)}
                style={{ background: trackStyling }}
            />
            <span className="time-display">
                {formatTime(trackProgress / SCALE_FACTOR)} / {formatTime(duration / SCALE_FACTOR)}
            </span>
        </div>
    );
}