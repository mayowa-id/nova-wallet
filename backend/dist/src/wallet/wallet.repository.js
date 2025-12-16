"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const wallet_entity_1 = require("./entities/wallet.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
let WalletRepository = class WalletRepository {
    constructor(db) {
        this.db = db;
    }
    async createWallet(data) {
        const wallet = await this.db.wallet.create({
            data,
        });
        return new wallet_entity_1.Wallet(wallet);
    }
    async findById(id) {
        const wallet = await this.db.wallet.findUnique({
            where: { id },
        });
        return wallet ? new wallet_entity_1.Wallet(wallet) : null;
    }
    async updateBalance(id, balance) {
        const wallet = await this.db.wallet.update({
            where: { id },
            data: { balance },
        });
        return new wallet_entity_1.Wallet(wallet);
    }
    async createTransaction(data) {
        const transaction = await this.db.transaction.create({
            data,
        });
        return new transaction_entity_1.Transaction(transaction);
    }
    async findTransactionsByWalletId(walletId) {
        const transactions = await this.db.transaction.findMany({
            where: {
                OR: [
                    { walletId },
                    { sourceWalletId: walletId },
                    { destinationWalletId: walletId },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        return transactions.map((tx) => new transaction_entity_1.Transaction(tx));
    }
    async findTransactionByIdempotencyKey(key) {
        const transaction = await this.db.transaction.findUnique({
            where: { idempotencyKey: key },
        });
        return transaction ? new transaction_entity_1.Transaction(transaction) : null;
    }
    async executeInTransaction(callback) {
        return this.db.$transaction(async () => {
            return callback();
        });
    }
};
exports.WalletRepository = WalletRepository;
exports.WalletRepository = WalletRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WalletRepository);
//# sourceMappingURL=wallet.repository.js.map