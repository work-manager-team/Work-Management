import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../db/database.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DatabaseModule, ConfigModule, AuthModule, EmailModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
