import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';
import { InMemoryStorage } from '../storage/in-memory.storage';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletRepository, InMemoryStorage],
})
export class WalletModule {}