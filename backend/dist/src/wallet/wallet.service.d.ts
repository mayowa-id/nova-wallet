import { WalletRepository } from './wallet.repository';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { Wallet } from './entities/wallet.entity';
export declare class WalletService {
    private readonly walletRepository;
    constructor(walletRepository: WalletRepository);
    createWallet(createWalletDto: CreateWalletDto): Promise<Wallet>;
    fundWallet(walletId: string, fundWalletDto: FundWalletDto): Promise<WalletResponseDto>;
    transfer(transferDto: TransferDto): Promise<{
        sourceWallet: Wallet;
        destinationWallet: Wallet;
        transactions: any[];
    }>;
    getWalletDetails(walletId: string): Promise<WalletResponseDto>;
    private roundToTwoDecimals;
}
