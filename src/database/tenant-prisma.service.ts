/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './database.service';
import { TenantContext } from './tenant-context.service';

const TENANT_SCOPED_MODELS = ['branch', 'role', 'subscription'];

@Injectable()
export class TenantPrismaService extends PrismaService implements OnModuleInit {
  private readonly tenantLogger = new Logger(TenantPrismaService.name);

  constructor(private readonly tenantContext: TenantContext) {
    super();
  }

  override async onModuleInit() {
    await super.onModuleInit();
    this.applyTenantMiddleware();
  }

  private applyTenantMiddleware(): void {
    (this as any).$use((params: any, next: any) => {
      const modelName = params.model?.toLowerCase();

      if (!modelName || !TENANT_SCOPED_MODELS.includes(modelName)) {
        return next(params);
      }

      let tenantId: string | undefined;
      try {
        tenantId = this.tenantContext.tenantId;
      } catch {
        return next(params);
      }

      const readOps = [
        'findMany',
        'findFirst',
        'findFirstOrThrow',
        'count',
        'aggregate',
      ];
      const writeOps = [
        'create',
        'createMany',
        'update',
        'updateMany',
        'upsert',
        'delete',
        'deleteMany',
      ];

      if (readOps.includes(params.action)) {
        params.args.where = { ...params.args.where, tenantId };
      }

      if (writeOps.includes(params.action)) {
        if (params.action === 'create') {
          params.args.data = { ...params.args.data, tenantId };
        }
        if (
          ['update', 'updateMany', 'delete', 'deleteMany'].includes(
            params.action,
          )
        ) {
          params.args.where = { ...params.args.where, tenantId };
        }
      }

      return next(params);
    });

    this.tenantLogger.log('Tenant middleware applied');
  }
}
