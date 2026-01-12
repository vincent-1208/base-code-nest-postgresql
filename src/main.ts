import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './swagger';
import { SWAGGER_API_ENDPOINT } from './swagger/swagger.constant';
import Helmet from 'helmet';
import { json } from 'body-parser';
import { API_PREFIX } from '@shared/src/constants';
import { RequestMethod, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure and enable CORS in a secure, configurable way
  const corsEnabled = configService.get<boolean>('CORS_ENABLED', true);
  if (corsEnabled) {
    const rawOrigins = configService.get<string | string[]>('CORS_ORIGIN', '*');
    const origins = Array.isArray(rawOrigins)
      ? rawOrigins
      : typeof rawOrigins === 'string' && rawOrigins !== '*'
        ? rawOrigins
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : rawOrigins; // '*' kept as-is

    app.enableCors({
      origin: origins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders:
        'Content-Type, Accept, Authorization, Origin, X-Requested-With',
      credentials: true,
      maxAge: 86400,
    });
  }
  app.setGlobalPrefix(API_PREFIX, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  setupSwagger(app);
  app.use(Helmet());
  app.use(json({ limit: '50mb' }));

  await app.listen(configService.get<number>('BE_PORT') ?? 3000);
  console.log(
    `http://127.0.0.1:${configService.get<number>('BE_PORT')}${SWAGGER_API_ENDPOINT}`,
  );
}
bootstrap();
