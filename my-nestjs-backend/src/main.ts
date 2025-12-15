// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // Enable CORS - Allow all origins for development
  app.enableCors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: false, // Must be false when origin is '*'
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();
  return app;
};

// For local development
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3000', 10); // ✅ Sửa ở đây
  createNestServer(server)
    .then(() => 
      server.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Application is running on: http://localhost:${port}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      })
    )
    .catch(err => console.error('Error starting server', err));
}

// For Vercel serverless
createNestServer(server)
  .then(() => console.log('✅ Nest ready for Vercel'))
  .catch(err => console.error('❌ Error:', err));

export default server;