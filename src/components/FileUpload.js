import React, { useState } from 'react';
import { uploadResume, uploadProfilePicture } from '../utils/storage_utils';

/**
 * File upload component for user profile pictures and resumes
 * 
 * @param {Object} props
 * @param {string} props.type - Type of file to upload ('resume' or 'profile_picture')
 * @param {string} props.userId - User ID for storage path
 * @param {function} props.onUploadSuccess - Callback function with file URL after successful upload
 * @param {function} props.onUploadError - Callback function with error after failed upload
 * @param {string} props.accept - File types to accept (e.g. 'image/*', 'application/pdf')
 * @param {string} props.currentFileUrl - Current file URL (if any)
 */
const FileUpload = ({ 
  type, 
  userId, 
  onUploadSuccess, 
  onUploadError, 
  accept = 'image/*',
  currentFileUrl = '' 
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentFileUrl);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // If it's an image, show preview
    if (selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      // Free memory when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!userId) {
      setError('User ID is missing');
      onUploadError && onUploadError('User ID is missing');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress <= 90 ? newProgress : 90;
        });
      }, 300);

      let result;
      if (type === 'resume') {
        result = await uploadResume(file, userId);
      } else if (type === 'profile_picture') {
        result = await uploadProfilePicture(file, userId);
      } else {
        throw new Error('Invalid upload type');
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        onUploadSuccess && onUploadSuccess(result.url, result.path);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed');
      setUploading(false);
      onUploadError && onUploadError(error.message || 'Upload failed');
    }
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
      // Extract filename from URL
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="file-upload mb-3">
      {/* File input */}
      <div className="mb-3">
        <label htmlFor={`file-${type}`} className="form-label">
          {type === 'resume' ? 'Upload Resume' : 'Upload Profile Picture'}
        </label>
        <input
          id={`file-${type}`}
          type="file"
          className="form-control"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {/* Preview for images */}
      {previewUrl && type === 'profile_picture' && (
        <div className="mb-3">
          <div className="preview-container" style={{ maxWidth: '150px', maxHeight: '150px' }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="img-thumbnail" 
              style={{ maxWidth: '100%', maxHeight: '150px' }} 
            />
          </div>
        </div>
      )}

      {/* Current file display for resumes */}
      {currentFileUrl && type === 'resume' && !file && (
        <div className="mb-3">
          <p>Current resume: {getFileNameFromUrl(currentFileUrl)}</p>
        </div>
      )}

      {/* Upload button */}
      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? `Uploading... ${progress}%` : 'Upload'}
      </button>

      {/* Error message */}
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default FileUpload; 