import { IsString, IsNumber, IsPositive, IsOptional, IsUUID } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsUUID()
  sourceWalletId: string;

  @IsString()
  @IsUUID()
  destinationWalletId: string;

  @IsNumber()
  @IsPositive({ message: 'Amount must be positive' })
  amount: number;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}