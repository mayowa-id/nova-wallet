import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class WalletRepository {
  constructor(private readonly db: DatabaseService) {}

  async createWallet(data: { currency: string; balance: number }): Promise {
    const wallet = await this.db.wallet.create({
      data,
    });
    return new Wallet(wallet);
  }

  async findById(id: string): Promise {
    const wallet = await this.db.wallet.findUnique({
      where: { id },
    });
    return wallet ? new Wallet(wallet) : null;
  }

  async updateBalance(id: string, balance: number): Promise {
    const wallet = await this.db.wallet.update({
      where: { id },
      data: { balance },
    });
    return new Wallet(wallet);
  }

  async createTransaction(data: {
    walletId: string;
    sourceWalletId?: string;
    destinationWalletId?: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: string;
    idempotencyKey?: string;
  }): Promise {
    const transaction = await this.db.transaction.create({
      data,
    });
    return new Transaction(transaction as any);
  }

  async findTransactionsByWalletId(walletId: string): Promise {
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
    return transactions.map((tx) => new Transaction(tx as any));
  }

  async findTransactionByIdempotencyKey(key: string): Promise {
    const transaction = await this.db.transaction.findUnique({
      where: { idempotencyKey: key },
    });
    return transaction ? new Transaction(transaction as any) : null;
  }

  async executeInTransaction(callback: () => Promise): Promise {
    return this.db.$transaction(async () => {
      return callback();
    });
  }
}