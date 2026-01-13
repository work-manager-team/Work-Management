// src/attachments/attachments.service.ts
import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../db/database.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { attachments } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import * as schema from '../db/schema';

@Injectable()
export class AttachmentsService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
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
    const [attachment] = await this.db
      .insert(attachments)
      .values({
        publicId: result.public_id,
        secureUrl: result.secure_url,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        width: result.width || null,
        height: result.height || null,
        uploadedBy: dto.uploadedBy,
        entityType: dto.entityType,
        entityId: dto.entityId || null,
      })
      .returning();

    return attachment;
  }

  /**
   * Get all attachments for an entity
   */
  async findByEntity(entityType: string, entityId: number) {
    return this.db
      .select()
      .from(attachments)
      .where(and(eq(attachments.entityType, entityType), eq(attachments.entityId, entityId)));
  }

  /**
   * Get single attachment by ID
   */
  async findOne(id: number) {
    const [attachment] = await this.db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id));

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  /**
   * Get user avatar attachment
   */
  async findUserAvatar(userId: number) {
    const [attachment] = await this.db
      .select()
      .from(attachments)
      .where(and(eq(attachments.entityType, 'user_avatar'), eq(attachments.uploadedBy, userId)))
      .orderBy(attachments.createdAt)
      .limit(1);

    return attachment || null;
  }

  /**
   * Delete attachment
   */
  async remove(id: number, userId: number) {
    const attachment = await this.findOne(id);

    // Check permission: only uploader can delete
    if (attachment.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have permission to delete this attachment');
    }

    // Delete from Cloudinary
    await this.cloudinary.deleteFile(attachment.publicId);

    // Delete from database
    await this.db.delete(attachments).where(eq(attachments.id, id));

    return { message: 'Attachment deleted successfully' };
  }

  /**
   * Delete all attachments for an entity (used when deleting entity)
   */
  async removeByEntity(entityType: string, entityId: number) {
    const entityAttachments = await this.findByEntity(entityType, entityId);

    for (const attachment of entityAttachments) {
      // Delete from Cloudinary
      await this.cloudinary.deleteFile(attachment.publicId);

      // Delete from database
      await this.db.delete(attachments).where(eq(attachments.id, attachment.id));
    }

    return { message: `${entityAttachments.length} attachments deleted successfully` };
  }
}
