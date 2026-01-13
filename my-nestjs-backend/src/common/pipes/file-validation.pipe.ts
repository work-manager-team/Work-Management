// src/common/pipes/file-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private options: FileValidationOptions = {}) {
    // Default: 10MB max size
    this.options.maxSize = this.options.maxSize || 10 * 1024 * 1024;

    // Default allowed mime types
    this.options.allowedMimeTypes = this.options.allowedMimeTypes || [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Text
      'text/plain',
      'text/csv',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
    ];
  }

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check file size
    if (file.size > this.options.maxSize!) {
      const maxSizeMB = (this.options.maxSize! / 1024 / 1024).toFixed(2);
      throw new BadRequestException(
        `File size exceeds limit (${maxSizeMB}MB). Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Check MIME type
    if (!this.options.allowedMimeTypes!.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.options.allowedMimeTypes!.join(', ')}`,
      );
    }

    return file;
  }
}
