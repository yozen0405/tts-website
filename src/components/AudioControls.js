import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

const AudioControls = ({ isPlaying, onPlayPauseClick }) => (
    <div className="audio-controls">
        {isPlaying ? (
            <button
                type="button"
                className="play-pause-button"
                onClick={() => onPlayPauseClick(false)}
            >
                <FontAwesomeIcon icon={faPause} />
            </button>
        ) : (
            <button
                type="button"
                className="play-pause-button"
                onClick={() => onPlayPauseClick(true)}
            >
                <FontAwesomeIcon icon={faPlay} />
            </button>
        )}
    </div>
);

export default AudioControls;
