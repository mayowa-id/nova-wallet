"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const wallet_repository_1 = require("./wallet.repository");
const wallet_response_dto_1 = require("./dto/wallet-response.dto");
const transaction_type_enum_1 = require("./enums/transaction-type.enum");
const transaction_status_enum_1 = require("./enums/transaction-status.enum");
let WalletService = class WalletService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async createWallet(createWalletDto) {
        const wallet = await this.walletRepository.createWallet({
            currency: createWalletDto.currency || 'USD',
            balance: 0,
        });
        return wallet;
    }
    async fundWallet(walletId, fundWalletDto) {
        if (fundWalletDto.idempotencyKey) {
            const existingTx = await this.walletRepository.findTransactionByIdempotencyKey(fundWalletDto.idempotencyKey);
            if (existingTx) {
                const wallet = await this.walletRepository.findById(walletId);
                return new wallet_response_dto_1.WalletResponseDto(wallet, [existingTx]);
            }
        }
        return this.walletRepository.executeInTransaction(async () => {
            const wallet = await this.walletRepository.findById(walletId);
            if (!wallet) {
                throw new common_1.NotFoundException(`Wallet with ID ${walletId} not found`);
            }
            const balanceBefore = wallet.balance;
            const newBalance = this.roundToTwoDecimals(wallet.balance + fundWalletDto.amount);
            const updatedWallet = await this.walletRepository.updateBalance(walletId, newBalance);
            const transaction = await this.walletRepository.createTransaction({
                walletId: wallet.id,
                type: transaction_type_enum_1.TransactionType.FUND,
                amount: fundWalletDto.amount,
                balanceBefore,
                balanceAfter: newBalance,
                status: transaction_status_enum_1.TransactionStatus.SUCCESS,
                idempotencyKey: fundWalletDto.idempotencyKey,
            });
            return new wallet_response_dto_1.WalletResponseDto(updatedWallet, [transaction]);
        });
    }
    async transfer(transferDto) {
        if (transferDto.sourceWalletId === transferDto.destinationWalletId) {
            throw new common_1.BadRequestException('Cannot transfer to the same wallet');
        }
        if (transferDto.idempotencyKey) {
            const existingTx = await this.walletRepository.findTransactionByIdempotencyKey(transferDto.idempotencyKey);
            if (existingTx) {
                const sourceWallet = await this.walletRepository.findById(transferDto.sourceWalletId);
                const destinationWallet = await this.walletRepository.findById(transferDto.destinationWalletId);
                return {
                    sourceWallet: sourceWallet,
                    destinationWallet: destinationWallet,
                    transactions: [existingTx],
                };
            }
        }
        return this.walletRepository.executeInTransaction(async () => {
            const sourceWallet = await this.walletRepository.findById(transferDto.sourceWalletId);
            if (!sourceWallet) {
                throw new common_1.NotFoundException(`Source wallet with ID ${transferDto.sourceWalletId} not found`);
            }
            const destinationWallet = await this.walletRepository.findById(transferDto.destinationWalletId);
            if (!destinationWallet) {
                throw new common_1.NotFoundException(`Destination wallet with ID ${transferDto.destinationWalletId} not found`);
            }
            if (sourceWallet.balance < transferDto.amount) {
                throw new common_1.BadRequestException(`Insufficient balance. Available: ${sourceWallet.balance}, Required: ${transferDto.amount}`);
            }
            const sourceBalanceBefore = sourceWallet.balance;
            const destinationBalanceBefore = destinationWallet.balance;
            const newSourceBalance = this.roundToTwoDecimals(sourceWallet.balance - transferDto.amount);
            const newDestinationBalance = this.roundToTwoDecimals(destinationWallet.balance + transferDto.amount);
            const updatedSourceWallet = await this.walletRepository.updateBalance(sourceWallet.id, newSourceBalance);
            const updatedDestinationWallet = await this.walletRepository.updateBalance(destinationWallet.id, newDestinationBalance);
            const transferOutTransaction = await this.walletRepository.createTransaction({
                walletId: sourceWallet.id,
                sourceWalletId: sourceWallet.id,
                destinationWalletId: destinationWallet.id,
                type: transaction_type_enum_1.TransactionType.TRANSFER_OUT,
                amount: transferDto.amount,
                balanceBefore: sourceBalanceBefore,
                balanceAfter: newSourceBalance,
                status: transaction_status_enum_1.TransactionStatus.SUCCESS,
                idempotencyKey: transferDto.idempotencyKey,
            });
            const transferInTransaction = await this.walletRepository.createTransaction({
                walletId: destinationWallet.id,
                sourceWalletId: sourceWallet.id,
                destinationWalletId: destinationWallet.id,
                type: transaction_type_enum_1.TransactionType.TRANSFER_IN,
                amount: transferDto.amount,
                balanceBefore: destinationBalanceBefore,
                balanceAfter: newDestinationBalance,
                status: transaction_status_enum_1.TransactionStatus.SUCCESS,
            });
            return {
                sourceWallet: updatedSourceWallet,
                destinationWallet: updatedDestinationWallet,
                transactions: [transferOutTransaction, transferInTransaction],
            };
        });
    }
    async getWalletDetails(walletId) {
        const wallet = await this.walletRepository.findById(walletId);
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet with ID ${walletId} not found`);
        }
        const transactions = await this.walletRepository.findTransactionsByWalletId(walletId);
        return new wallet_response_dto_1.WalletResponseDto(wallet, transactions);
    }
    roundToTwoDecimals(value) {
        return Math.round(value * 100) / 100;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallet_repository_1.WalletRepository])
], WalletService);
//# sourceMappingURL=wallet.service.js.map