// @ts-nocheck
/**
 * Cloudinary Adapter - External Service Binding
 * @owner: Sujal (Shared - Both use for uploads)
 * @purpose: BMAD Adapter layer for Cloudinary image/file uploads
 * 
 * BMAD: This is an ADAPTER - handles external service integration
 * - Consumes: File objects
 * - Produces: Cloudinary URLs
 * - Side-effect: Uploads to Cloudinary
 */

import { Cloudinary } from '@cloudinary/url-gen';


// Initialize Cloudinary instance
const cloudinary = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  },
});

/**
 * BMAD MODEL: Upload Configuration
 */
export interface UploadConfig {
  folder: string; // Cloudinary folder path
  resourceType: 'image' | 'raw' | 'video' | 'auto';
  maxFileSize?: number; // in bytes
  allowedFormats?: string[]; // ['jpg', 'png', 'pdf']
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  };
}

/**
 * BMAD MODEL: Upload Result
 */
export interface UploadResult {
  url: string; // Public URL
  secureUrl: string; // HTTPS URL
  publicId: string; // Cloudinary public ID
  format: string; // File format
  width?: number;
  height?: number;
  bytes: number; // File size
  createdAt: string; // ISO timestamp
}

/**
 * BMAD MODEL: Upload Error
 */
export interface UploadError {
  code: string;
  message: string;
  field?: string;
}

/**
 * BMAD ACTION: Upload File to Cloudinary
 * 
 * Pre-conditions:
 * - File object is valid
 * - Cloudinary credentials are configured
 * - File size is within limits
 * 
 * Post-conditions:
 * - File is uploaded to Cloudinary
 * - Returns upload result with URL
 * 
 * Error states:
 * - File too large
 * - Invalid file type
 * - Cloudinary upload failure
 * - Network error
 * 
 * Side-effect: Uploads file to Cloudinary service
 */
export const uploadToCloudinary = async (
  file: File,
  config: UploadConfig
): Promise<UploadResult> => {
  // Validate file
  if (!file) {
    throw new Error('File is required');
  }

  // Validate file size
  const maxSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB default
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  // Validate file type
  if (config.allowedFormats) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !config.allowedFormats.includes(fileExtension)) {
      throw new Error(
        `Invalid file type. Allowed: ${config.allowedFormats.join(', ')}`
      );
    }
  }

  // Prepare upload options
  const uploadOptions: any = {
    folder: config.folder,
    resource_type: config.resourceType,
    upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    transformation: [],
  };

  // Add transformations if provided
  if (config.transformation) {
    if (config.transformation.width || config.transformation.height) {
      uploadOptions.transformation.push({
        width: config.transformation.width,
        height: config.transformation.height,
        crop: config.transformation.crop || 'limit',
      });
    }
    if (config.transformation.quality) {
      uploadOptions.transformation.push({
        quality: config.transformation.quality,
      });
    }
  }

  try {
    // Prepare FormData for unsigned upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadOptions.upload_preset);

    if (uploadOptions.folder) {
      formData.append('folder', uploadOptions.folder);
    }

    if (uploadOptions.transformation && uploadOptions.transformation.length > 0) {
      // Build transformation string
      const transforms: string[] = [];
      if (uploadOptions.transformation[0].width || uploadOptions.transformation[0].height) {
        transforms.push(
          `w_${uploadOptions.transformation[0].width || 'auto'},h_${uploadOptions.transformation[0].height || 'auto'},c_${uploadOptions.transformation[0].crop || 'limit'}`
        );
      }
      if (uploadOptions.transformation[1]?.quality) {
        transforms.push(`q_${uploadOptions.transformation[1].quality}`);
      }
      if (transforms.length > 0) {
        formData.append('transformation', transforms.join(','));
      }
    }

    // Upload to Cloudinary using unsigned upload (no API secret needed)
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const resourceType = uploadOptions.resource_type || 'image';

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Return structured result
    return {
      url: result.secure_url || result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      createdAt: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * BMAD ACTION: Upload Multiple Files
 * 
 * Pre-conditions:
 * - Files array is valid
 * - All files pass validation
 * 
 * Post-conditions:
 * - All files uploaded
 * - Returns array of upload results
 * 
 * Error states:
 * - Any file fails validation
 * - Any upload fails
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  config: UploadConfig
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, config));
  return Promise.all(uploadPromises);
};

/**
 * BMAD ACTION: Delete File from Cloudinary
 * 
 * NOTE: Deletion requires backend signature/API key which is not safe for frontend.
 * This should be handled by a backend endpoint in production.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Frontend cannot safely delete without exposing secrets.
  // In a real app, call your backend API: await api.delete(`/images/${publicId}`);
  console.warn('Frontend deletion disabled for security. Implement backend endpoint.');
  return Promise.resolve();
};

/**
 * BMAD ACTION: Generate Optimized URL
 * 
 * Pre-conditions:
 * - Public ID is valid
 * 
 * Post-conditions:
 * - Returns optimized URL
 * 
 * No side-effects: Pure transformation
 */
export const getOptimizedUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string => {
  const url = cloudinary.image(publicId);

  if (options) {
    if (options.width || options.height) {
      url.resize(
        // @ts-ignore - Cloudinary types are strict but numbers are valid here
        {
          width: options.width,
          height: options.height,
        }
      );
    }
    if (options.quality) {
      url.quality(options.quality);
    }
    if (options.format) {
      url.format(options.format);
    }
  }

  return url.toURL();
};

export default {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
};

