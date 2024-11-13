// Loader.js
import { BeatLoader } from 'react-spinners';
import './Loader.css';

export default function Loader({ color = '#331', size = 15 }) {
    return (
        <div className="loader-container">
            <BeatLoader color={color} size={size} />
        </div>
    );
}