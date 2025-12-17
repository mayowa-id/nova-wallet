"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const app_module_1 = require("../src/app.module");
const server = (0, express_1.default)();
let app;
async function createNestServer(expressInstance) {
    if (!app) {
        app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressInstance), { logger: ['error', 'warn', 'log'] });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.enableCors();
        await app.init();
        console.log(' Nest Ready');
    }
    return app;
}
createNestServer(server).catch((err) => console.error(' Nest broken', err));
exports.default = server;
//# sourceMappingURL=index.js.map