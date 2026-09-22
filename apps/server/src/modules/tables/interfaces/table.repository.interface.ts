export interface ITableRepository {
  findFloorPlansByVenue(venueId: string): Promise<any[]>;
  createFloorPlan(venueId: string, data: any): Promise<any>;
  findTablesWithActiveOrders(venueId: string): Promise<any[]>;
  findTableById(id: string): Promise<any>;
  createTable(data: any): Promise<any>;
  updateTable(id: string, data: any): Promise<any>;
  deleteTable(id: string): Promise<void>;
  updateTableStatus(id: string, status: any): Promise<any>;
  transferOrderToTable(sourceTableId: string, targetTableId: string, orderId: string): Promise<void>;
}
