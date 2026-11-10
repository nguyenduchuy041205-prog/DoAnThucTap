import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)

  // ── Global Prefix & Versioning ─────────────────────────────────────────────
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
  })

  // ── Global Pipes ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Strip unknown fields
      forbidNonWhitelisted: true,
      transform: true,         // Auto-transform to DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // ── Global Filters & Interceptors ──────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  // ── Swagger / OpenAPI ──────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CROP COOP API')
    .setDescription(
      'API truy xuất nguồn gốc nông sản hợp tác xã — RESTful v1',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Đăng nhập & quản lý phiên')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Zones & Lots', 'Vùng trồng và lô đất')
    .addTag('Seasons', 'Mùa vụ & Quarantine Engine')
    .addTag('Diary', 'Nhật ký sản xuất E-Diary')
    .addTag('Inventory', 'Kho vật tư')
    .addTag('Harvest', 'Thu hoạch & chất lượng')
    .addTag('QR Codes', 'Mã QR truy xuất')
    .addTag('Orders', 'Đơn hàng Public Portal')
    .addTag('Audit', 'Lịch sử thay đổi')
    .addTag('Config', 'Cấu hình hệ thống')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

  await app.listen(port)
  console.log(`🚀 CROP COOP API running at: http://localhost:${port}/api/v1`)
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`)
}

bootstrap()

