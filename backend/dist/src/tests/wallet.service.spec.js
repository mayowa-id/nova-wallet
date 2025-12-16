"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const wallet_service_1 = require("../wallet/wallet.service");
const wallet_repository_1 = require("../wallet/wallet.repository");
const database_service_1 = require("../database/database.service");
describe('WalletService', () => {
    let service;
    let repository;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [wallet_service_1.WalletService, wallet_repository_1.WalletRepository, database_service_1.DatabaseService],
        }).compile();
        service = module.get(wallet_service_1.WalletService);
        repository = module.get(wallet_repository_1.WalletRepository);
    });
    describe('createWallet', () => {
        it('should create a wallet with default currency USD', async () => {
            const result = await service.createWallet({});
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.currency).toBe('USD');
            expect(result.balance).toBe(0);
        });
    });
});
//# sourceMappingURL=wallet.service.spec.js.map