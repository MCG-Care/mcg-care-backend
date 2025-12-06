"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('MCG Care API')
        .setDescription('Backend API for MCG Care - Customer Product Management and Service Booking System')
        .setVersion('1.0')
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('products', 'Product management')
        .addTag('customer-products', 'Customer product registration')
        .addTag('service-types', 'Service type management')
        .addTag('technician-services', 'Technician service assignments')
        .addTag('timeslots', 'Timeslot management')
        .addTag('bookings', 'Booking management')
        .addTag('service-logs', 'Service log tracking')
        .addTag('feedbacks', 'Customer feedback')
        .addTag('forum', 'Forum posts and comments')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        customSiteTitle: 'MCG Care API Docs',
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Application running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map