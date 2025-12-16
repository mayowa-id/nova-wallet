import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletRepository, DatabaseService],
})
export class WalletModule {}