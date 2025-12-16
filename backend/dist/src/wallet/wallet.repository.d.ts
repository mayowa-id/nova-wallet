import { DatabaseService } from '../database/database.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
export declare class WalletRepository {
    private readonly db;
    constructor(db: DatabaseService);
    createWallet(data: {
        currency: string;
        balance: number;
    }): Promise<Wallet>;
    findById(id: string): Promise<Wallet | null>;
    updateBalance(id: string, balance: number): Promise<Wallet>;
    createTransaction(data: {
        walletId: string;
        sourceWalletId?: string;
        destinationWalletId?: string;
        type: string;
        amount: number;
        balanceBefore: number;
        balanceAfter: number;
        status: string;
        idempotencyKey?: string;
    }): Promise<Transaction>;
    findTransactionsByWalletId(walletId: string): Promise<Transaction[]>;
    findTransactionByIdempotencyKey(key: string): Promise<Transaction | null>;
    executeInTransaction<T>(callback: () => Promise<T>): Promise<T>;
}
