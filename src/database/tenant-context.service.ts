import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface TenantStore {
  tenantId: string;
  userId: string;
  branchId?: string | null;
}

@Injectable()
export class TenantContext {
  private readonly storage = new AsyncLocalStorage<TenantStore>();

  run(store: TenantStore, callback: () => void): void {
    this.storage.run(store, callback);
  }

  get tenantId(): string {
    const store = this.storage.getStore();
    if (!store?.tenantId) {
      throw new Error(
        'TenantContext: tenantId not set. Is TenantGuard applied?',
      );
    }
    return store.tenantId;
  }

  get userId(): string {
    const store = this.storage.getStore();
    if (!store?.userId) {
      throw new Error('TenantContext: userId not set. Is JwtGuard applied?');
    }
    return store.userId;
  }

  get branchId(): string | undefined {
    const store = this.storage.getStore();
    return store?.branchId ?? undefined;
  }

  getStore(): TenantStore | undefined {
    return this.storage.getStore();
  }
}
