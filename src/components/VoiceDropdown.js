import { useState, useEffect, useRef } from 'react';
import './VoiceDropdown.css';

export default function VoiceDropdown({ options, onSelect, onChange = false, placeholder = "Select", disabled = false }) {
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState(placeholder);
	const dropdownRef = useRef(null);

	const handleSelect = (option) => {
		setSelected(option.value);
		setIsOpen(false);
		onSelect(option); 
	};

	useEffect(() => {
		setSelected(placeholder);
	}, [placeholder, onChange]);

	const toggleDropdown = () => {
		if (!disabled) {
			setIsOpen(!isOpen);
		}
	};

	useEffect(() => {
		if (disabled) {
			setIsOpen(false);
		}
	}, [disabled]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className={`dropdown ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
			<div className="dropdown-header" onClick={toggleDropdown}>
				{selected.value}
				<span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>&#9660;</span>
			</div>
		{isOpen && (
			<div className="dropdown-list">
				{options.map((option) => (
					<div
						key={option.id} 
						className="dropdown-item"
						onClick={() => handleSelect(option)}
					>
						{option.value}
					</div>
				))}
			</div>
		)}
		</div>
	);
}