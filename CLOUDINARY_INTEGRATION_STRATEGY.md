# ☁️ Cloudinary Integration Strategy - File & Image Management

## 📋 Executive Summary

This document outlines the complete strategy for integrating **Cloudinary** cloud storage into the Work Management system for file and image uploads.

---

## 🎯 Goals

1. ✅ Allow users to upload images/files (avatars, task attachments, project files)
2. ✅ Store and manage files on Cloudinary (not on server filesystem)
3. ✅ Provide file management (upload, delete, list, retrieve)
4. ✅ Optimize images automatically (compression, resizing, formats)
5. ✅ Keep costs at $0 using Cloudinary Free Tier

---

## 💰 Cloudinary Free Tier Limits

| Resource | Free Tier Limit |
|----------|----------------|
| **Storage** | 25 GB |
| **Bandwidth** | 25 GB/month |
| **Transformations** | 25,000/month |
| **Max File Size** | 10 MB (images), 100 MB (videos) |
| **API Requests** | Unlimited |

**Verdict**: ✅ Perfect for small-to-medium projects. Monitor usage via Cloudinary dashboard.

---

## 🏗️ Architecture Design

### Use Cases

1. **User Avatar Upload** (`/users/avatar`)
2. **Task File Attachments** (`/tasks/:id/attachments`)
3. **Project Files** (`/projects/:id/files`)
4. **Comment Attachments** (`/comments/:id/attachments`)

### File Flow

```
Client (Browser/Mobile)
    ↓ (1) Upload request with file
NestJS Backend
    ↓ (2) Validate file (type, size, auth)
    ↓ (3) Upload to Cloudinary SDK
Cloudinary Cloud
    ↓ (4) Returns public_id, secure_url
NestJS Backend
    ↓ (5) Save metadata to PostgreSQL
    ↓ (6) Return file info to client
Client
    ✅ Display image/file
```

### Database Schema Changes

**New Table: `attachments`**
```sql
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  public_id VARCHAR(255) NOT NULL UNIQUE,  -- Cloudinary public_id
  secure_url TEXT NOT NULL,                 -- Cloudinary secure URL
  resource_type VARCHAR(50) NOT NULL,       -- 'image', 'raw', 'video'
  format VARCHAR(10),                        -- 'jpg', 'png', 'pdf', etc.
  bytes INTEGER,                             -- File size in bytes
  width INTEGER,                             -- Image width (if image)
  height INTEGER,                            -- Image height (if image)

  -- Relationship
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,         -- 'user_avatar', 'task', 'project', 'comment'
  entity_id INTEGER,                         -- ID of related entity

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (uploaded_by)
);
```

**Update Existing Tables**:
```sql
-- Add avatar_url to users table
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN avatar_public_id VARCHAR(255);
```

---

## 🔧 Implementation Plan

### Step 1: Install Dependencies

```bash
npm install cloudinary multer @nestjs/platform-express
npm install --save-dev @types/multer
```

### Step 2: Cloudinary Configuration

**File: `src/cloudinary/cloudinary.config.ts`**
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  },
};
```

**Environment Variables (`.env`)**:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Cloudinary Service

**File: `src/cloudinary/cloudinary.service.ts`**
```typescript
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
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get optimized image URL with transformations
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
}
```

### Step 4: Cloudinary Module

**File: `src/cloudinary/cloudinary.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.config';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
```

### Step 5: File Validation Pipe

**File: `src/common/pipes/file-validation.pipe.ts`**
```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private options: FileValidationOptions = {}) {
    this.options.maxSize = this.options.maxSize || 10 * 1024 * 1024; // 10MB default
    this.options.allowedMimeTypes = this.options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
  }

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check file size
    if (file.size > this.options.maxSize!) {
      throw new BadRequestException(
        `File size exceeds limit (${this.options.maxSize! / 1024 / 1024}MB)`,
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
```

### Step 6: Attachments Service

**File: `src/attachments/attachments.service.ts`**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { attachments } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface CreateAttachmentDto {
  uploadedBy: number;
  entityType: 'user_avatar' | 'task' | 'project' | 'comment';
  entityId?: number;
}

@Injectable()
export class AttachmentsService {
  constructor(
    private db: DatabaseService,
    private cloudinary: CloudinaryService,
  ) {}

  /**
   * Upload and save attachment
   */
  async create(file: Express.Multer.File, dto: CreateAttachmentDto) {
    // Upload to Cloudinary
    const folder = `work-management/${dto.entityType}`;
    const result = await this.cloudinary.uploadFile(file, folder);

    // Save to database
    const [attachment] = await this.db.drizzle.insert(attachments).values({
      publicId: result.public_id,
      secureUrl: result.secure_url,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      uploadedBy: dto.uploadedBy,
      entityType: dto.entityType,
      entityId: dto.entityId,
    }).returning();

    return attachment;
  }

  /**
   * Get all attachments for an entity
   */
  async findByEntity(entityType: string, entityId: number) {
    return this.db.drizzle
      .select()
      .from(attachments)
      .where(and(
        eq(attachments.entityType, entityType),
        eq(attachments.entityId, entityId),
      ));
  }

  /**
   * Delete attachment
   */
  async remove(id: number, userId: number) {
    const [attachment] = await this.db.drizzle
      .select()
      .from(attachments)
      .where(eq(attachments.id, id));

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // TODO: Add permission check (only owner or admin can delete)

    // Delete from Cloudinary
    await this.cloudinary.deleteFile(attachment.publicId);

    // Delete from database
    await this.db.drizzle.delete(attachments).where(eq(attachments.id, id));

    return { message: 'Attachment deleted successfully' };
  }
}
```

### Step 7: Attachments Controller (Example: User Avatar)

**File: `src/users/users.controller.ts`** (add to existing controller)
```typescript
import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AttachmentsService } from '../attachments/attachments.service';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(
    private attachmentsService: AttachmentsService,
    // ... other services
  ) {}

  /**
   * Upload user avatar
   */
  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser('userId') userId: number,
  ) {
    // TODO: Delete old avatar if exists

    const attachment = await this.attachmentsService.create(file, {
      uploadedBy: userId,
      entityType: 'user_avatar',
      entityId: userId,
    });

    // Update user's avatar_url in database
    // await this.usersService.updateAvatar(userId, attachment.secureUrl, attachment.publicId);

    return {
      message: 'Avatar uploaded successfully',
      avatar: {
        url: attachment.secureUrl,
        thumbnail: this.cloudinary.getThumbnailUrl(attachment.publicId, 150, 150),
      },
    };
  }

  /**
   * Delete user avatar
   */
  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAvatar(@CurrentUser('userId') userId: number) {
    // TODO: Find and delete user's avatar attachment
    // const attachments = await this.attachmentsService.findByEntity('user_avatar', userId);
    // if (attachments.length > 0) {
    //   await this.attachmentsService.remove(attachments[0].id, userId);
    // }
    return;
  }
}
```

### Step 8: Task Attachments Controller

**File: `src/tasks/tasks.controller.ts`** (add endpoints)
```typescript
/**
 * Upload task attachment
 */
@Post(':id/attachments')
@UseInterceptors(FileInterceptor('file'))
async uploadAttachment(
  @Param('id', ParseIntPipe) taskId: number,
  @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  @CurrentUser('userId') userId: number,
) {
  // TODO: Verify user has access to this task

  const attachment = await this.attachmentsService.create(file, {
    uploadedBy: userId,
    entityType: 'task',
    entityId: taskId,
  });

  // Send notification to task members
  // await this.notificationsHelper.notifyTaskAttachmentAdded(taskId, userId, attachment);

  return {
    message: 'File uploaded successfully',
    attachment: {
      id: attachment.id,
      url: attachment.secureUrl,
      filename: file.originalname,
      size: attachment.bytes,
      type: attachment.format,
      uploadedAt: attachment.createdAt,
    },
  };
}

/**
 * Get all task attachments
 */
@Get(':id/attachments')
async getAttachments(@Param('id', ParseIntPipe) taskId: number) {
  const attachments = await this.attachmentsService.findByEntity('task', taskId);
  return attachments.map((att) => ({
    id: att.id,
    url: att.secureUrl,
    thumbnail: att.resourceType === 'image'
      ? this.cloudinary.getThumbnailUrl(att.publicId)
      : null,
    size: att.bytes,
    format: att.format,
    uploadedAt: att.createdAt,
  }));
}

/**
 * Delete task attachment
 */
@Delete(':taskId/attachments/:attachmentId')
@HttpCode(HttpStatus.NO_CONTENT)
async deleteAttachment(
  @Param('taskId', ParseIntPipe) taskId: number,
  @Param('attachmentId', ParseIntPipe) attachmentId: number,
  @CurrentUser('userId') userId: number,
) {
  await this.attachmentsService.remove(attachmentId, userId);
  return;
}
```

---

## 🔒 Security Considerations

### 1. File Validation
- ✅ Validate MIME type (don't trust client)
- ✅ Check file size limits
- ✅ Sanitize filenames
- ✅ Scan for malware (optional: use ClamAV or similar)

### 2. Authentication
- ✅ Require JWT authentication for all uploads
- ✅ Verify user has permission to upload to entity (task/project)

### 3. Rate Limiting
- ✅ Add rate limiting to upload endpoints (e.g., 10 uploads per minute per user)
- ✅ Use `@nestjs/throttler` package

### 4. Cloudinary Security
- ✅ Never expose API Secret to client
- ✅ Use signed URLs for sensitive files
- ✅ Set folder restrictions in Cloudinary dashboard

---

## 📱 Frontend Integration

### React Example

```typescript
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://your-api.com/users/avatar', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.avatar.url;
};

// Usage in component
<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      uploadAvatar(e.target.files[0]);
    }
  }}
/>
```

---

## 📊 Monitoring & Optimization

### Cloudinary Dashboard
- Monitor storage usage (must stay under 25GB)
- Track bandwidth (must stay under 25GB/month)
- View transformation credits used

### Optimization Tips
1. **Lazy Load Images**: Use `loading="lazy"` attribute
2. **Responsive Images**: Request different sizes based on device
3. **Format Auto**: Let Cloudinary choose best format (WebP, AVIF)
4. **Compress on Upload**: Use quality=auto in transformations
5. **CDN Caching**: Cloudinary automatically uses CDN

---

## 🚀 Deployment Checklist

- [ ] Create Cloudinary account (free tier)
- [ ] Add Cloudinary credentials to `.env`
- [ ] Add credentials to Vercel environment variables
- [ ] Create database migration for `attachments` table
- [ ] Implement CloudinaryModule
- [ ] Implement AttachmentsService
- [ ] Add upload endpoints to controllers
- [ ] Add rate limiting to upload routes
- [ ] Test file uploads (images, PDFs, docs)
- [ ] Test file deletion
- [ ] Test error handling (invalid files, size exceeded)
- [ ] Update API documentation
- [ ] Test on production with real users

---

## 📈 Future Enhancements

1. **Direct Upload from Client** (Signed URLs)
   - Client uploads directly to Cloudinary
   - Backend generates signed upload URL
   - Reduces backend load

2. **Image Transformations**
   - Auto-crop faces for avatars
   - Generate multiple sizes (thumbnail, medium, large)
   - Add watermarks to project files

3. **Video Support**
   - Upload and stream videos
   - Generate video thumbnails
   - Adaptive bitrate streaming

4. **Drag & Drop UI**
   - File drop zones in frontend
   - Progress bars for uploads
   - Preview before upload

5. **Batch Operations**
   - Upload multiple files at once
   - Bulk delete attachments

---

## 💡 Cost Management

### Stay Within Free Tier

1. **Optimize Images**: Always use transformations to reduce bandwidth
2. **Delete Unused Files**: Implement cleanup jobs for deleted tasks/projects
3. **Lazy Loading**: Don't load all images at once
4. **Cache Aggressively**: Use browser cache and CDN
5. **Monitor Usage**: Set up alerts in Cloudinary dashboard

**Upgrade Triggers**:
- If storage exceeds 20GB → Consider cleanup or upgrade
- If bandwidth exceeds 20GB/month → Optimize images more
- If transformations exceed 20k/month → Consider caching transformed URLs

---

## 📞 API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/avatar` | POST | Upload user avatar |
| `/users/avatar` | DELETE | Delete user avatar |
| `/tasks/:id/attachments` | POST | Upload task file |
| `/tasks/:id/attachments` | GET | Get task attachments |
| `/tasks/:id/attachments/:attachmentId` | DELETE | Delete attachment |
| `/projects/:id/files` | POST | Upload project file |
| `/projects/:id/files` | GET | Get project files |
| `/comments/:id/attachments` | POST | Upload comment attachment |

---

## ✅ Summary

This strategy provides a complete, production-ready solution for file uploads using Cloudinary:

1. ✅ **Free Tier Friendly** - 25GB storage + 25GB bandwidth
2. ✅ **Secure** - Authentication, validation, rate limiting
3. ✅ **Optimized** - Automatic compression, format conversion, CDN
4. ✅ **Scalable** - Can handle thousands of files
5. ✅ **Easy to Maintain** - Clean architecture, reusable services

**Next Steps**: Review this strategy, then we'll implement step-by-step starting with the CloudinaryModule and AttachmentsService.
