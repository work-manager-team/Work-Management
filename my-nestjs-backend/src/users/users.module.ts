import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../db/database.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [DatabaseModule, ConfigModule, AuthModule, EmailModule, AttachmentsModule, CloudinaryModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
