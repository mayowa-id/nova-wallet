import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Global instance to reuse connections
let prismaInstance: PrismaClient | null = null;

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        log: ['error', 'warn'],
      });
    }
    super();
    return prismaInstance as any;
  }

  async onModuleInit() {
    await this.$connect();
  }
}