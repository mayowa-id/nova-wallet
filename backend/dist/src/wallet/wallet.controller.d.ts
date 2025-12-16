import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    createWallet(createWalletDto: CreateWalletDto): Promise<import("./entities/wallet.entity").Wallet>;
    fundWallet(id: string, fundWalletDto: FundWalletDto): Promise<import("./dto/wallet-response.dto").WalletResponseDto>;
    transfer(transferDto: TransferDto): Promise<{
        sourceWallet: import("./entities/wallet.entity").Wallet;
        destinationWallet: import("./entities/wallet.entity").Wallet;
        transactions: any[];
    }>;
    getWalletDetails(id: string): Promise<import("./dto/wallet-response.dto").WalletResponseDto>;
}
