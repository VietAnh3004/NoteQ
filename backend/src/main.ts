import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as morgan from 'morgan';
import * as compression from 'compression';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { env } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const setMiddleware = (app: NestExpressApplication) => {
  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: `http://localhost:${env.ui.port}`,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
      message: 'Too many requests from this source, please try again later.',
      standardHeaders: 'draft-7',
      legacyHeaders: false,

      keyGenerator: (req: Request): string => {
        const refreshToken = req.cookies?.[env.cookie.refresh.name];
        if (refreshToken) {
          return `rt:${refreshToken}`;
        } else {
          return `ip:${req.ip}`;
        }
      },
    }),
  );

  app.use(morgan('combined'));

  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger('[]'),
  });
  app.useLogger(new Logger('APP'));
  const logger = new Logger('APP');

  app.set('trust proxy', 1);

  app.setGlobalPrefix('api');

  setMiddleware(app);

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NoteQ')
      .setDescription('API documentation for NoteQ backend')
      .setVersion('alpha')
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, swaggerDocument, {
      explorer: true,
      customSiteTitle: 'NoteQ API Docs',
      swaggerOptions: {
        docExpansion: 'none',
        defaultModelsExpandDepth: -1,
        filter: true,
        url: `/api/swagger-json?v=${Date.now()}`,
      },
      jsonDocumentUrl: 'swagger/json',
    });
  }

  await app.listen(env.port, () =>
    logger.warn(`> Listening on port ${env.port}`),
  );
}

try {
  bootstrap();
} catch (err) {
  console.log(err.message);
}
