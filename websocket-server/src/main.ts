import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Socket.IO adapter for WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS for HTTP
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'https://work-management-chi.vercel.app',
      'https://jira-frontend-roan.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 WebSocket Server is running on port ${port}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${port}/notifications`);
}

bootstrap();
