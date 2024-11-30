import React from 'react';

const FileViewer = ({ isOpen, onClose, url, previewLoading, setPreviewLoading }) => {
	if (!isOpen) return null;

	const handleLoad = () => {
		setPreviewLoading(false);
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button className="close-button" onClick={onClose}>X</button>
				<h2>Attachment Preview</h2>
				{previewLoading && (
					<div className="loading-container">
						<p className="loading-text">Preparing your preview, just a moment...</p>
					</div>
				)}
				<img
					src={url}
					style={{ width: '100%', height: '80vh', objectFit: 'contain',display: previewLoading ? 'none' : 'block', }}
					frameBorder="0"
					title="Attachment Preview"
					onLoad={() => {
						handleLoad();
					}}		
					onError={() => console.error('Failed to load iframe')}
				/>
			</div>
		</div>
	);
};

export default FileViewer;