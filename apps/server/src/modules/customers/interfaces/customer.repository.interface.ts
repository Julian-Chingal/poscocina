export interface ICustomerRepository {
  search(venueId: string, q?: string, limit?: number): Promise<any[]>;
  findById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  addLoyaltyPointsAndSpend(customerId: string, spendAmount: number): Promise<void>;
}
