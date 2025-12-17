"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
let cachedHandler;
async function bootstrap() {
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
    app.enableCors();
    await app.init();
    return (0, serverless_http_1.default)(expressApp);
}
async function handler(req, res) {
    if (!cachedHandler) {
        cachedHandler = await bootstrap();
    }
    return cachedHandler(req, res);
}
//# sourceMappingURL=index.js.map