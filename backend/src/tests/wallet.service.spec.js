"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@nestjs/testing");
var common_1 = require("@nestjs/common");
var wallet_service_1 = require("../src/wallet/wallet.service");
var wallet_repository_1 = require("../src/wallet/wallet.repository");
var in_memory_storage_1 = require("../src/storage/in-memory.storage");
describe('WalletService', function () {
    var service;
    var storage;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        providers: [wallet_service_1.WalletService, wallet_repository_1.WalletRepository, in_memory_storage_1.InMemoryStorage],
                    }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(wallet_service_1.WalletService);
                    storage = module.get(in_memory_storage_1.InMemoryStorage);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () {
        storage.clearAll();
    });
    describe('createWallet', function () {
        it('should create a wallet with default currency USD', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.id).toBeDefined();
                        expect(result.currency).toBe('USD');
                        expect(result.balance).toBe(0);
                        expect(result.createdAt).toBeInstanceOf(Date);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should create a wallet with custom currency', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({ currency: 'EUR' })];
                    case 1:
                        result = _a.sent();
                        expect(result.currency).toBe('EUR');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('fundWallet', function () {
        it('should fund a wallet successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var wallet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        wallet = _a.sent();
                        return [4 /*yield*/, service.fundWallet(wallet.id, { amount: 100 })];
                    case 2:
                        result = _a.sent();
                        expect(result.wallet.balance).toBe(100);
                        expect(result.transactions).toHaveLength(1);
                        expect(result.transactions[0].amount).toBe(100);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException for non-existent wallet', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(service.fundWallet('non-existent-id', { amount: 100 })).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle idempotency correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var wallet, idempotencyKey, result1, result2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        wallet = _a.sent();
                        idempotencyKey = 'test-key-123';
                        return [4 /*yield*/, service.fundWallet(wallet.id, {
                                amount: 100,
                                idempotencyKey: idempotencyKey,
                            })];
                    case 2:
                        result1 = _a.sent();
                        return [4 /*yield*/, service.fundWallet(wallet.id, {
                                amount: 100,
                                idempotencyKey: idempotencyKey,
                            })];
                    case 3:
                        result2 = _a.sent();
                        expect(result1.wallet.balance).toBe(100);
                        expect(result2.wallet.balance).toBe(100);
                        expect(result1.transactions[0].id).toBe(result2.transactions[0].id);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('transfer', function () {
        it('should transfer funds between wallets', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sourceWallet, destWallet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        sourceWallet = _a.sent();
                        return [4 /*yield*/, service.createWallet({})];
                    case 2:
                        destWallet = _a.sent();
                        return [4 /*yield*/, service.fundWallet(sourceWallet.id, { amount: 200 })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, service.transfer({
                                sourceWalletId: sourceWallet.id,
                                destinationWalletId: destWallet.id,
                                amount: 50,
                            })];
                    case 4:
                        result = _a.sent();
                        expect(result.sourceWallet.balance).toBe(150);
                        expect(result.destinationWallet.balance).toBe(50);
                        expect(result.transactions).toHaveLength(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException for insufficient balance', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sourceWallet, destWallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        sourceWallet = _a.sent();
                        return [4 /*yield*/, service.createWallet({})];
                    case 2:
                        destWallet = _a.sent();
                        return [4 /*yield*/, service.fundWallet(sourceWallet.id, { amount: 50 })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, expect(service.transfer({
                                sourceWalletId: sourceWallet.id,
                                destinationWalletId: destWallet.id,
                                amount: 100,
                            })).rejects.toThrow(common_1.BadRequestException)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException for same wallet transfer', function () { return __awaiter(void 0, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        wallet = _a.sent();
                        return [4 /*yield*/, expect(service.transfer({
                                sourceWalletId: wallet.id,
                                destinationWalletId: wallet.id,
                                amount: 50,
                            })).rejects.toThrow(common_1.BadRequestException)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle idempotency correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sourceWallet, destWallet, idempotencyKey, result1, result2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        sourceWallet = _a.sent();
                        return [4 /*yield*/, service.createWallet({})];
                    case 2:
                        destWallet = _a.sent();
                        return [4 /*yield*/, service.fundWallet(sourceWallet.id, { amount: 200 })];
                    case 3:
                        _a.sent();
                        idempotencyKey = 'transfer-key-123';
                        return [4 /*yield*/, service.transfer({
                                sourceWalletId: sourceWallet.id,
                                destinationWalletId: destWallet.id,
                                amount: 50,
                                idempotencyKey: idempotencyKey,
                            })];
                    case 4:
                        result1 = _a.sent();
                        return [4 /*yield*/, service.transfer({
                                sourceWalletId: sourceWallet.id,
                                destinationWalletId: destWallet.id,
                                amount: 50,
                                idempotencyKey: idempotencyKey,
                            })];
                    case 5:
                        result2 = _a.sent();
                        expect(result1.sourceWallet.balance).toBe(150);
                        expect(result2.sourceWallet.balance).toBe(150);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getWalletDetails', function () {
        it('should return wallet with transaction history', function () { return __awaiter(void 0, void 0, void 0, function () {
            var wallet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.createWallet({})];
                    case 1:
                        wallet = _a.sent();
                        return [4 /*yield*/, service.fundWallet(wallet.id, { amount: 100 })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, service.getWalletDetails(wallet.id)];
                    case 3:
                        result = _a.sent();
                        expect(result.wallet).toBeDefined();
                        expect(result.transactions).toHaveLength(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException for non-existent wallet', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(service.getWalletDetails('non-existent-id')).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
