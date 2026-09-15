// @ts-nocheck
/**
 * React Hook for Cloudinary Uploads
 * @owner: Sujal (Shared - Both use)
 * @purpose: React hook wrapper for upload actions
 */

import { useState, useCallback } from 'react';
import {
  uploadProfilePhoto,
  uploadProfilePhotos,
  uploadVerificationDocument,
  uploadChatImage,
  uploadChatImages,
  UploadResult,
} from '../../core/actions/uploadActions';

interface UseUploadReturn {
  upload: (file: File, type: 'profile' | 'verification' | 'chat') => Promise<UploadResult>;
  uploadMultiple: (
    files: File[],
    type: 'profile' | 'chat'
  ) => Promise<UploadResult[]>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

/**
 * Hook for handling file uploads to Cloudinary
 */
export const useCloudinaryUpload = (): UseUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (
      file: File,
      type: 'profile' | 'verification' | 'chat'
    ): Promise<UploadResult> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        let result: UploadResult;

        switch (type) {
          case 'profile':
            result = await uploadProfilePhoto(file);
            break;
          case 'verification':
            result = await uploadVerificationDocument(file);
            break;
          case 'chat':
            result = await uploadChatImage(file);
            break;
          default:
            throw new Error('Invalid upload type');
        }

        setProgress(100);
        setIsUploading(false);
        return result;
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        setIsUploading(false);
        setProgress(0);
        throw err;
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (
      files: File[],
      type: 'profile' | 'chat'
    ): Promise<UploadResult[]> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        let results: UploadResult[];

        switch (type) {
          case 'profile':
            results = await uploadProfilePhotos(files);
            break;
          case 'chat':
            results = await uploadChatImages(files);
            break;
          default:
            throw new Error('Invalid upload type');
        }

        setProgress(100);
        setIsUploading(false);
        return results;
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        setIsUploading(false);
        setProgress(0);
        throw err;
      }
    },
    []
  );

  return {
    upload,
    uploadMultiple,
    isUploading,
    error,
    progress,
  };
};

