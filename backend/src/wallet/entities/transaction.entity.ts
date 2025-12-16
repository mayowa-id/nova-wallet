import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class Transaction {
  id: string;
  walletId: string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  idempotencyKey?: string;
  createdAt: Date;

  constructor(partial: Partial<Transaction>) { // Add <Transaction>
    Object.assign(this, partial);
  }
}