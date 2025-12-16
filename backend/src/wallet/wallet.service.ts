import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { WalletRepository } from './wallet.repository';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { InMemoryStorage } from '../storage/in-memory.storage';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly storage: InMemoryStorage,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise {
    const wallet = new Wallet({
      id: uuidv4(),
      currency: createWalletDto.currency || 'USD',
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.walletRepository.save(wallet);
  }

  async fundWallet(
    walletId: string,
    fundWalletDto: FundWalletDto,
  ): Promise {
    // Check idempotency
    if (fundWalletDto.idempotencyKey) {
      const existingResponse = this.storage.getIdempotentResponse(
        fundWalletDto.idempotencyKey,
      );
      if (existingResponse) {
        return existingResponse;
      }
    }

    // Acquire lock
    const releaseLock = await this.walletRepository.acquireLock(walletId);

    try {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }

      const balanceBefore = wallet.balance;
      wallet.balance = this.roundToTwoDecimals(
        wallet.balance + fundWalletDto.amount,
      );
      wallet.updatedAt = new Date();

      await this.walletRepository.save(wallet);

      const transaction = new Transaction({
        id: uuidv4(),
        walletId: wallet.id,
        type: TransactionType.FUND,
        amount: fundWalletDto.amount,
        balanceBefore,
        balanceAfter: wallet.balance,
        status: TransactionStatus.SUCCESS,
        idempotencyKey: fundWalletDto.idempotencyKey,
        createdAt: new Date(),
      });

      await this.walletRepository.saveTransaction(transaction);

      const response = new WalletResponseDto(wallet, [transaction]);

      // Store idempotent response
      if (fundWalletDto.idempotencyKey) {
        this.storage.setIdempotentResponse(
          fundWalletDto.idempotencyKey,
          response,
        );
      }

      return response;
    } finally {
      releaseLock();
    }
  }

  async transfer(transferDto: TransferDto): Promise {
    // Validate same wallet transfer
    if (transferDto.sourceWalletId === transferDto.destinationWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    // Check idempotency
    if (transferDto.idempotencyKey) {
      const existingResponse = this.storage.getIdempotentResponse(
        transferDto.idempotencyKey,
      );
      if (existingResponse) {
        return existingResponse;
      }
    }

    // Acquire locks in consistent order to prevent deadlocks
    const [firstWalletId, secondWalletId] = [
      transferDto.sourceWalletId,
      transferDto.destinationWalletId,
    ].sort();

    const releaseFirstLock =
      await this.walletRepository.acquireLock(firstWalletId);
    const releaseSecondLock =
      await this.walletRepository.acquireLock(secondWalletId);

    try {
      // Fetch wallets
      const sourceWallet = await this.walletRepository.findById(
        transferDto.sourceWalletId,
      );
      if (!sourceWallet) {
        throw new NotFoundException(
          `Source wallet with ID ${transferDto.sourceWalletId} not found`,
        );
      }

      const destinationWallet = await this.walletRepository.findById(
        transferDto.destinationWalletId,
      );
      if (!destinationWallet) {
        throw new NotFoundException(
          `Destination wallet with ID ${transferDto.destinationWalletId} not found`,
        );
      }

      // Check sufficient balance
      if (sourceWallet.balance < transferDto.amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${sourceWallet.balance}, Required: ${transferDto.amount}`,
        );
      }

      // Perform transfer
      const sourceBalanceBefore = sourceWallet.balance;
      const destinationBalanceBefore = destinationWallet.balance;

      sourceWallet.balance = this.roundToTwoDecimals(
        sourceWallet.balance - transferDto.amount,
      );
      destinationWallet.balance = this.roundToTwoDecimals(
        destinationWallet.balance + transferDto.amount,
      );

      sourceWallet.updatedAt = new Date();
      destinationWallet.updatedAt = new Date();

      await this.walletRepository.save(sourceWallet);
      await this.walletRepository.save(destinationWallet);

      // Create transactions
      const transferOutTransaction = new Transaction({
        id: uuidv4(),
        walletId: sourceWallet.id,
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destinationWallet.id,
        type: TransactionType.TRANSFER_OUT,
        amount: transferDto.amount,
        balanceBefore: sourceBalanceBefore,
        balanceAfter: sourceWallet.balance,
        status: TransactionStatus.SUCCESS,
        idempotencyKey: transferDto.idempotencyKey,
        createdAt: new Date(),
      });

      const transferInTransaction = new Transaction({
        id: uuidv4(),
        walletId: destinationWallet.id,
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destinationWallet.id,
        type: TransactionType.TRANSFER_IN,
        amount: transferDto.amount,
        balanceBefore: destinationBalanceBefore,
        balanceAfter: destinationWallet.balance,
        status: TransactionStatus.SUCCESS,
        idempotencyKey: transferDto.idempotencyKey,
        createdAt: new Date(),
      });

      await this.walletRepository.saveTransaction(transferOutTransaction);
      await this.walletRepository.saveTransaction(transferInTransaction);

      const response = {
        sourceWallet,
        destinationWallet,
        transactions: [transferOutTransaction, transferInTransaction],
      };

      // Store idempotent response
      if (transferDto.idempotencyKey) {
        this.storage.setIdempotentResponse(transferDto.idempotencyKey, response);
      }

      return response;
    } finally {
      releaseSecondLock();
      releaseFirstLock();
    }
  }

  async getWalletDetails(walletId: string): Promise {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const transactions =
      await this.walletRepository.findTransactionsByWalletId(walletId);

    return new WalletResponseDto(wallet, transactions);
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}