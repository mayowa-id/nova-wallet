import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { Wallet } from './entities/wallet.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionStatus } from './enums/transaction-status.enum';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise <Wallet> {
    const wallet = await this.walletRepository.createWallet({
      currency: createWalletDto.currency || 'USD',
      balance: 0,
    });
    return wallet;
  }

  async fundWallet(
    walletId: string,
    fundWalletDto: FundWalletDto,
  ): Promise<WalletResponseDto> {
    // Check idempotency
    if (fundWalletDto.idempotencyKey) {
      const existingTx = await this.walletRepository.findTransactionByIdempotencyKey(
        fundWalletDto.idempotencyKey,
      );
      if (existingTx) {
        const wallet = await this.walletRepository.findById(walletId);
        return new WalletResponseDto(wallet!, [existingTx]);
      }
    }

    return this.walletRepository.executeInTransaction(async () => {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }

      const balanceBefore = wallet.balance;
      const newBalance = this.roundToTwoDecimals(wallet.balance + fundWalletDto.amount);

      const updatedWallet = await this.walletRepository.updateBalance(walletId, newBalance);

      const transaction = await this.walletRepository.createTransaction({
        walletId: wallet.id,
        type: TransactionType.FUND,
        amount: fundWalletDto.amount,
        balanceBefore,
        balanceAfter: newBalance,
        status: TransactionStatus.SUCCESS,
        idempotencyKey: fundWalletDto.idempotencyKey,
      });

      return new WalletResponseDto(updatedWallet, [transaction]);
    });
  }

  async transfer(transferDto: TransferDto):Promise<{
    sourceWallet: Wallet;
    destinationWallet: Wallet;
    transactions: any[];}> {
    // Validate same wallet transfer
    if (transferDto.sourceWalletId === transferDto.destinationWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    // Check idempotency
    if (transferDto.idempotencyKey) {
      const existingTx = await this.walletRepository.findTransactionByIdempotencyKey(
        transferDto.idempotencyKey,
      );
      if (existingTx) {
        const sourceWallet = await this.walletRepository.findById(
          transferDto.sourceWalletId,
        );
        const destinationWallet = await this.walletRepository.findById(
          transferDto.destinationWalletId,
        );
        return {
          sourceWallet: sourceWallet!,
          destinationWallet: destinationWallet!,
          transactions: [existingTx],
        };
      }
    }

    return this.walletRepository.executeInTransaction(async () => {
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

      // Calculate new balances
      const sourceBalanceBefore = sourceWallet.balance;
      const destinationBalanceBefore = destinationWallet.balance;

      const newSourceBalance = this.roundToTwoDecimals(
        sourceWallet.balance - transferDto.amount,
      );
      const newDestinationBalance = this.roundToTwoDecimals(
        destinationWallet.balance + transferDto.amount,
      );

      // Update balances
      const updatedSourceWallet = await this.walletRepository.updateBalance(
        sourceWallet.id,
        newSourceBalance,
      );
      const updatedDestinationWallet = await this.walletRepository.updateBalance(
        destinationWallet.id,
        newDestinationBalance,
      );

      // Create transactions
      const transferOutTransaction = await this.walletRepository.createTransaction({
        walletId: sourceWallet.id,
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destinationWallet.id,
        type: TransactionType.TRANSFER_OUT,
        amount: transferDto.amount,
        balanceBefore: sourceBalanceBefore,
        balanceAfter: newSourceBalance,
        status: TransactionStatus.SUCCESS,
        idempotencyKey: transferDto.idempotencyKey,
      });

      const transferInTransaction = await this.walletRepository.createTransaction({
        walletId: destinationWallet.id,
        sourceWalletId: sourceWallet.id,
        destinationWalletId: destinationWallet.id,
        type: TransactionType.TRANSFER_IN,
        amount: transferDto.amount,
        balanceBefore: destinationBalanceBefore,
        balanceAfter: newDestinationBalance,
        status: TransactionStatus.SUCCESS,
      });

      return {
        sourceWallet: updatedSourceWallet,
        destinationWallet: updatedDestinationWallet,
        transactions: [transferOutTransaction, transferInTransaction],
      };
    });
  }

  async getWalletDetails(walletId: string): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const transactions = await this.walletRepository.findTransactionsByWalletId(
      walletId,
    );

    return new WalletResponseDto(wallet, transactions);
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}