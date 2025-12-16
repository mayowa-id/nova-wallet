import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @IsPositive({ message: 'Amount must be positive' })
  amount: number;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}