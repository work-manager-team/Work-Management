// src/cloudinary/cloudinary.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

@Injectable()
export class CloudinaryService {
  /**
   * Upload file to Cloudinary
   * @param file - Multer file object
   * @param folder - Cloudinary folder (default: 'work-management')
   * @param options - Additional Cloudinary upload options
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'work-management',
    options: any = {},
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto', // Auto-detect: image, video, raw
          ...options,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            return reject(new BadRequestException(`Upload failed: ${error.message}`));
          }
          if (!result) {
            return reject(new BadRequestException('Upload failed: No result returned'));
          }

          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Delete file from Cloudinary
   * @param publicId - Cloudinary public_id
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Delete failed with result: ${result.result}`);
      }
    } catch (error: any) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param publicId - Cloudinary public_id
   * @param options - Transformation options
   */
  getOptimizedUrl(publicId: string, options: any = {}): string {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      ...options,
    });
  }

  /**
   * Get thumbnail URL
   * @param publicId - Cloudinary public_id
   * @param width - Thumbnail width (default: 200)
   * @param height - Thumbnail height (default: 200)
   */
  getThumbnailUrl(publicId: string, width: number = 200, height: number = 200): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto',
    });
  }

  /**
   * Get avatar URL with circular crop
   * @param publicId - Cloudinary public_id
   * @param size - Avatar size (default: 150)
   */
  getAvatarUrl(publicId: string, size: number = 150): string {
    return cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'face',
      radius: 'max', // Circular crop
      fetch_format: 'auto',
      quality: 'auto',
    });
  }
}
