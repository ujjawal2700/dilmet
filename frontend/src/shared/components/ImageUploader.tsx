/**
 * Image Uploader Component
 * @owner: Sujal (Shared - Both use)
 * @purpose: Reusable component for image uploads
 */

import { useRef, useState } from 'react';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { UploadResult } from '../../core/adapters/cloudinary';

interface ImageUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  uploadType: 'profile' | 'verification' | 'chat';
  maxFiles?: number;
  accept?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  uploadType,
  maxFiles = 1,
  accept = 'image/*',
  className = '',
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useCloudinaryUpload();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await upload(file, uploadType);
      onUploadComplete(result);
      setPreview(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      onUploadError?.(errorMessage);
      setPreview(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        multiple={maxFiles > 1}
        className="hidden"
        disabled={isUploading}
      />

      {children ? (
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      )}

      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs max-h-48 rounded"
          />
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

