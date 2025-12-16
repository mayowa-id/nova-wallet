import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
export declare class WalletResponseDto {
    wallet: Wallet;
    transactions?: Transaction[];
    constructor(wallet: Wallet, transactions?: Transaction[]);
}
