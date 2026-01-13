import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../db/database.module';
import { NotificationsService } from './notifications.service';
import { NotificationHelperService } from './notification-helper.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationsService, NotificationHelperService, NotificationsGateway],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationHelperService, NotificationsGateway],
})
export class NotificationsModule {}
