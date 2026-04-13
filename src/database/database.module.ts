import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database.service';
import { TenantContext } from './tenant-context.service';
import { TenantPrismaService } from './tenant-prisma.service';

@Global()
@Module({
  providers: [PrismaService, TenantContext, TenantPrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
