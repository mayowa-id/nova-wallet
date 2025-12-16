import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { DatabaseService } from 'src/database/database.service';

describe('WalletService', () => {
  let service: WalletService;
  let repository: WalletRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, WalletRepository, DatabaseService],
    }).compile();

    service = module.get<WalletService>(WalletService);
    repository = module.get<WalletRepository>(WalletRepository);
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