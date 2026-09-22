import { ITableRepository } from '../interfaces/table.repository.interface.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export class ManageTablesUseCase {
  constructor(private readonly tableRepo: ITableRepository) {}

  async getFloorPlans(venueId: string) {
    return await this.tableRepo.findFloorPlansByVenue(venueId);
  }

  async createFloorPlan(venueId: string, data: any) {
    return await this.tableRepo.createFloorPlan(venueId, data);
  }

  async getVenueTables(venueId: string) {
    return await this.tableRepo.findTablesWithActiveOrders(venueId);
  }

  async createTable(data: any) {
    return await this.tableRepo.createTable(data);
  }

  async updateTable(id: string, data: any) {
    const table = await this.tableRepo.findTableById(id);
    if (!table) throw new NotFoundError('Mesa no encontrada');
    return await this.tableRepo.updateTable(id, data);
  }

  async deleteTable(id: string) {
    const table = await this.tableRepo.findTableById(id);
    if (!table) throw new NotFoundError('Mesa no encontrada');
    if (table.status === 'occupied') {
      throw new BadRequestError('No se puede eliminar una mesa con comanda activa');
    }
    await this.tableRepo.deleteTable(id);
    return { success: true };
  }

  async updateTableStatus(id: string, status: any) {
    const table = await this.tableRepo.findTableById(id);
    if (!table) throw new NotFoundError('Mesa no encontrada');
    return await this.tableRepo.updateTableStatus(id, status);
  }

  async transferTable(sourceTableId: string, targetTableId: string) {
    const sourceTable = await this.tableRepo.findTableById(sourceTableId);
    if (!sourceTable || !sourceTable.currentOrderId) {
      throw new BadRequestError('La mesa origen no tiene comanda activa para transferir');
    }
    const targetTable = await this.tableRepo.findTableById(targetTableId);
    if (!targetTable) throw new NotFoundError('Mesa destino no encontrada');
    if (targetTable.status !== 'free' && targetTable.status !== 'reserved') {
      throw new BadRequestError('La mesa destino debe estar libre');
    }

    await this.tableRepo.transferOrderToTable(sourceTableId, targetTableId, sourceTable.currentOrderId);

    auditService.log({
      venueId: sourceTable.venueId,
      action: 'table:transferred',
      entityType: 'table',
      entityId: sourceTableId,
      payload: { targetTableId, orderId: sourceTable.currentOrderId },
    }).catch(() => {});

    return { success: true, orderId: sourceTable.currentOrderId };
  }
}
