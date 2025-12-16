
export class Wallet {
  id: string;
  currency: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial) {
    Object.assign(this, partial);
  }
}