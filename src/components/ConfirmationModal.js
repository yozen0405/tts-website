import React from 'react';
import './ConfirmationModal.css';

export default function ConfirmationModal({ isVisible, onConfirm, onCancel, message }) {
    if (!isVisible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className='modal-title'>
                    <p className="modal-message">{message || '您確定要執行此操作嗎？'}</p>
                </div>
                <div className="modal-actions">
                    <button className="modal-button cancel-button" onClick={onCancel}>
                        取消
                    </button>
                    <button className="modal-button confirm-button" onClick={onConfirm}>
                        確認
                    </button>
                </div>
            </div>
        </div>
    );
}