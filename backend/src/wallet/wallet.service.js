"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
var common_1 = require("@nestjs/common");
var uuid_1 = require("uuid");
var wallet_response_dto_1 = require("./dto/wallet-response.dto");
var wallet_entity_1 = require("./entities/wallet.entity");
var transaction_entity_1 = require("./entities/transaction.entity");
var transaction_type_enum_1 = require("./enums/transaction-type.enum");
var transaction_status_enum_1 = require("./enums/transaction-status.enum");
var WalletService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var WalletService = _classThis = /** @class */ (function () {
        function WalletService_1(walletRepository, storage) {
            this.walletRepository = walletRepository;
            this.storage = storage;
        }
        WalletService_1.prototype.createWallet = function (createWalletDto) {
            return __awaiter(this, void 0, void 0, function () {
                var wallet;
                return __generator(this, function (_a) {
                    wallet = new wallet_entity_1.Wallet({
                        id: (0, uuid_1.v4)(),
                        currency: createWalletDto.currency || 'USD',
                        balance: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    return [2 /*return*/, this.walletRepository.save(wallet)];
                });
            });
        };
        WalletService_1.prototype.fundWallet = function (walletId, fundWalletDto) {
            return __awaiter(this, void 0, void 0, function () {
                var existingResponse, releaseLock, wallet, balanceBefore, transaction, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Check idempotency
                            if (fundWalletDto.idempotencyKey) {
                                existingResponse = this.storage.getIdempotentResponse(fundWalletDto.idempotencyKey);
                                if (existingResponse) {
                                    return [2 /*return*/, existingResponse];
                                }
                            }
                            return [4 /*yield*/, this.walletRepository.acquireLock(walletId)];
                        case 1:
                            releaseLock = _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, , 6, 7]);
                            return [4 /*yield*/, this.walletRepository.findById(walletId)];
                        case 3:
                            wallet = _a.sent();
                            if (!wallet) {
                                throw new common_1.NotFoundException("Wallet with ID ".concat(walletId, " not found"));
                            }
                            balanceBefore = wallet.balance;
                            wallet.balance = this.roundToTwoDecimals(wallet.balance + fundWalletDto.amount);
                            wallet.updatedAt = new Date();
                            return [4 /*yield*/, this.walletRepository.save(wallet)];
                        case 4:
                            _a.sent();
                            transaction = new transaction_entity_1.Transaction({
                                id: (0, uuid_1.v4)(),
                                walletId: wallet.id,
                                type: transaction_type_enum_1.TransactionType.FUND,
                                amount: fundWalletDto.amount,
                                balanceBefore: balanceBefore,
                                balanceAfter: wallet.balance,
                                status: transaction_status_enum_1.TransactionStatus.SUCCESS,
                                idempotencyKey: fundWalletDto.idempotencyKey,
                                createdAt: new Date(),
                            });
                            return [4 /*yield*/, this.walletRepository.saveTransaction(transaction)];
                        case 5:
                            _a.sent();
                            response = new wallet_response_dto_1.WalletResponseDto(wallet, [transaction]);
                            // Store idempotent response
                            if (fundWalletDto.idempotencyKey) {
                                this.storage.setIdempotentResponse(fundWalletDto.idempotencyKey, response);
                            }
                            return [2 /*return*/, response];
                        case 6:
                            releaseLock();
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        WalletService_1.prototype.transfer = function (transferDto) {
            return __awaiter(this, void 0, void 0, function () {
                var existingResponse, _a, firstWalletId, secondWalletId, releaseFirstLock, releaseSecondLock, sourceWallet, destinationWallet, sourceBalanceBefore, destinationBalanceBefore, transferOutTransaction, transferInTransaction, response;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // Validate same wallet transfer
                            if (transferDto.sourceWalletId === transferDto.destinationWalletId) {
                                throw new common_1.BadRequestException('Cannot transfer to the same wallet');
                            }
                            // Check idempotency
                            if (transferDto.idempotencyKey) {
                                existingResponse = this.storage.getIdempotentResponse(transferDto.idempotencyKey);
                                if (existingResponse) {
                                    return [2 /*return*/, existingResponse];
                                }
                            }
                            _a = [
                                transferDto.sourceWalletId,
                                transferDto.destinationWalletId,
                            ].sort(), firstWalletId = _a[0], secondWalletId = _a[1];
                            return [4 /*yield*/, this.walletRepository.acquireLock(firstWalletId)];
                        case 1:
                            releaseFirstLock = _b.sent();
                            return [4 /*yield*/, this.walletRepository.acquireLock(secondWalletId)];
                        case 2:
                            releaseSecondLock = _b.sent();
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, , 10, 11]);
                            return [4 /*yield*/, this.walletRepository.findById(transferDto.sourceWalletId)];
                        case 4:
                            sourceWallet = _b.sent();
                            if (!sourceWallet) {
                                throw new common_1.NotFoundException("Source wallet with ID ".concat(transferDto.sourceWalletId, " not found"));
                            }
                            return [4 /*yield*/, this.walletRepository.findById(transferDto.destinationWalletId)];
                        case 5:
                            destinationWallet = _b.sent();
                            if (!destinationWallet) {
                                throw new common_1.NotFoundException("Destination wallet with ID ".concat(transferDto.destinationWalletId, " not found"));
                            }
                            // Check sufficient balance
                            if (sourceWallet.balance < transferDto.amount) {
                                throw new common_1.BadRequestException("Insufficient balance. Available: ".concat(sourceWallet.balance, ", Required: ").concat(transferDto.amount));
                            }
                            sourceBalanceBefore = sourceWallet.balance;
                            destinationBalanceBefore = destinationWallet.balance;
                            sourceWallet.balance = this.roundToTwoDecimals(sourceWallet.balance - transferDto.amount);
                            destinationWallet.balance = this.roundToTwoDecimals(destinationWallet.balance + transferDto.amount);
                            sourceWallet.updatedAt = new Date();
                            destinationWallet.updatedAt = new Date();
                            return [4 /*yield*/, this.walletRepository.save(sourceWallet)];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, this.walletRepository.save(destinationWallet)];
                        case 7:
                            _b.sent();
                            transferOutTransaction = new transaction_entity_1.Transaction({
                                id: (0, uuid_1.v4)(),
                                walletId: sourceWallet.id,
                                sourceWalletId: sourceWallet.id,
                                destinationWalletId: destinationWallet.id,
                                type: transaction_type_enum_1.TransactionType.TRANSFER_OUT,
                                amount: transferDto.amount,
                                balanceBefore: sourceBalanceBefore,
                                balanceAfter: sourceWallet.balance,
                                status: transaction_status_enum_1.TransactionStatus.SUCCESS,
                                idempotencyKey: transferDto.idempotencyKey,
                                createdAt: new Date(),
                            });
                            transferInTransaction = new transaction_entity_1.Transaction({
                                id: (0, uuid_1.v4)(),
                                walletId: destinationWallet.id,
                                sourceWalletId: sourceWallet.id,
                                destinationWalletId: destinationWallet.id,
                                type: transaction_type_enum_1.TransactionType.TRANSFER_IN,
                                amount: transferDto.amount,
                                balanceBefore: destinationBalanceBefore,
                                balanceAfter: destinationWallet.balance,
                                status: transaction_status_enum_1.TransactionStatus.SUCCESS,
                                idempotencyKey: transferDto.idempotencyKey,
                                createdAt: new Date(),
                            });
                            return [4 /*yield*/, this.walletRepository.saveTransaction(transferOutTransaction)];
                        case 8:
                            _b.sent();
                            return [4 /*yield*/, this.walletRepository.saveTransaction(transferInTransaction)];
                        case 9:
                            _b.sent();
                            response = {
                                sourceWallet: sourceWallet,
                                destinationWallet: destinationWallet,
                                transactions: [transferOutTransaction, transferInTransaction],
                            };
                            // Store idempotent response
                            if (transferDto.idempotencyKey) {
                                this.storage.setIdempotentResponse(transferDto.idempotencyKey, response);
                            }
                            return [2 /*return*/, response];
                        case 10:
                            releaseSecondLock();
                            releaseFirstLock();
                            return [7 /*endfinally*/];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        WalletService_1.prototype.getWalletDetails = function (walletId) {
            return __awaiter(this, void 0, void 0, function () {
                var wallet, transactions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.walletRepository.findById(walletId)];
                        case 1:
                            wallet = _a.sent();
                            if (!wallet) {
                                throw new common_1.NotFoundException("Wallet with ID ".concat(walletId, " not found"));
                            }
                            return [4 /*yield*/, this.walletRepository.findTransactionsByWalletId(walletId)];
                        case 2:
                            transactions = _a.sent();
                            return [2 /*return*/, new wallet_response_dto_1.WalletResponseDto(wallet, transactions)];
                    }
                });
            });
        };
        WalletService_1.prototype.roundToTwoDecimals = function (value) {
            return Math.round(value * 100) / 100;
        };
        return WalletService_1;
    }());
    __setFunctionName(_classThis, "WalletService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WalletService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WalletService = _classThis;
}();
exports.WalletService = WalletService;
