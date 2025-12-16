import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletService } from '../src/wallet/wallet.service';
import { WalletRepository } from '../src/wallet/wallet.repository';
import { InMemoryStorage } from '../src/storage/in-memory.storage';

describe('WalletService', () => {
  let service: WalletService;
  let storage: InMemoryStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, WalletRepository, InMemoryStorage],
    }).compile();

    service = module.get(WalletService);
    storage = module.get(InMemoryStorage);
  });

  afterEach(() => {
    storage.clearAll();
  });

  describe('createWallet', () => {
    it('should create a wallet with default currency USD', async () => {
      const result = await service.createWallet({});

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.currency).toBe('USD');
      expect(result.balance).toBe(0);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create a wallet with custom currency', async () => {
      const result = await service.createWallet({ currency: 'EUR' });

      expect(result.currency).toBe('EUR');
    });
  });

  describe('fundWallet', () => {
    it('should fund a wallet successfully', async () => {
      const wallet = await service.createWallet({});
      const result = await service.fundWallet(wallet.id, { amount: 100 });

      expect(result.wallet.balance).toBe(100);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].amount).toBe(100);
    });

    it('should throw NotFoundException for non-existent wallet', async () => {
      await expect(
        service.fundWallet('non-existent-id', { amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle idempotency correctly', async () => {
      const wallet = await service.createWallet({});
      const idempotencyKey = 'test-key-123';

      const result1 = await service.fundWallet(wallet.id, {
        amount: 100,
        idempotencyKey,
      });

      const result2 = await service.fundWallet(wallet.id, {
        amount: 100,
        idempotencyKey,
      });

      expect(result1.wallet.balance).toBe(100);
      expect(result2.wallet.balance).toBe(100);
      expect(result1.transactions[0].id).toBe(result2.transactions[0].id);
    });
  });

  describe('transfer', () => {
    it('should transfer funds between wallets', async () => {
      const sourceWallet = await service.createWallet({});
      const destWallet = await service.createWallet({});

      await service.fundWallet(sourceWallet.id, { amount: 200 });

      const result = await service.transfer({
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destWallet.id,
        amount: 50,
      });

      expect(result.sourceWallet.balance).toBe(150);
      expect(result.destinationWallet.balance).toBe(50);
      expect(result.transactions).toHaveLength(2);
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      const sourceWallet = await service.createWallet({});
      const destWallet = await service.createWallet({});

      await service.fundWallet(sourceWallet.id, { amount: 50 });

      await expect(
        service.transfer({
          sourceWalletId: sourceWallet.id,
          destinationWalletId: destWallet.id,
          amount: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for same wallet transfer', async () => {
      const wallet = await service.createWallet({});

      await expect(
        service.transfer({
          sourceWalletId: wallet.id,
          destinationWalletId: wallet.id,
          amount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle idempotency correctly', async () => {
      const sourceWallet = await service.createWallet({});
      const destWallet = await service.createWallet({});
      await service.fundWallet(sourceWallet.id, { amount: 200 });

      const idempotencyKey = 'transfer-key-123';

      const result1 = await service.transfer({
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destWallet.id,
        amount: 50,
        idempotencyKey,
      });

      const result2 = await service.transfer({
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destWallet.id,
        amount: 50,
        idempotencyKey,
      });

      expect(result1.sourceWallet.balance).toBe(150);
      expect(result2.sourceWallet.balance).toBe(150);
    });
  });

  describe('getWalletDetails', () => {
    it('should return wallet with transaction history', async () => {
      const wallet = await service.createWallet({});
      await service.fundWallet(wallet.id, { amount: 100 });

      const result = await service.getWalletDetails(wallet.id);

      expect(result.wallet).toBeDefined();
      expect(result.transactions).toHaveLength(1);
    });

    it('should throw NotFoundException for non-existent wallet', async () => {
      await expect(
        service.getWalletDetails('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});