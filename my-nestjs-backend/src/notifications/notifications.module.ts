import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../db/database.module';
import { NotificationsService } from './notifications.service';
import { NotificationHelperService } from './notification-helper.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { WebSocketTriggerService } from './websocket-trigger.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationsService, NotificationHelperService, NotificationsGateway, WebSocketTriggerService],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationHelperService, NotificationsGateway, WebSocketTriggerService],
})
export class NotificationsModule {}
