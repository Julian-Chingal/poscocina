import { IPrinterRepository, IPrinterDriver } from '../interfaces/hardware.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';

export class ManagePrinterUseCase {
  constructor(
    private readonly printerRepo: IPrinterRepository,
    private readonly driver: IPrinterDriver
  ) {}

  async getPrinters(venueId: string) {
    return await this.printerRepo.findPrintersByVenue(venueId);
  }

  async getPrinterById(id: string) {
    const printer = await this.printerRepo.findPrinterById(id);
    if (!printer) throw new NotFoundError('Impresora no encontrada');
    return printer;
  }

  async createPrinter(data: any) {
    return await this.printerRepo.createPrinter({
      venueId: data.venueId,
      name: data.name.trim(),
      station: data.station || 'kitchen',
      connectionType: data.connectionType || 'network_tcp',
      ipAddress: data.ipAddress?.trim() || null,
      port: data.port || 9100,
      paperWidth: data.paperWidth || '80',
      autoPrintOnOrder: data.autoPrintOnOrder ?? true,
      autoPrintOnPayment: data.autoPrintOnPayment ?? true,
      openDrawerOnPrint: data.openDrawerOnPrint ?? false,
      isActive: data.isActive ?? true,
    });
  }

  async updatePrinter(id: string, data: any) {
    await this.getPrinterById(id);
    return await this.printerRepo.updatePrinter(id, {
      ...(data.name && { name: data.name.trim() }),
      ...(data.station && { station: data.station }),
      ...(data.connectionType && { connectionType: data.connectionType }),
      ...(data.ipAddress !== undefined && { ipAddress: data.ipAddress?.trim() || null }),
      ...(data.port && { port: data.port }),
      ...(data.paperWidth && { paperWidth: data.paperWidth }),
      ...(data.autoPrintOnOrder !== undefined && { autoPrintOnOrder: data.autoPrintOnOrder }),
      ...(data.autoPrintOnPayment !== undefined && { autoPrintOnPayment: data.autoPrintOnPayment }),
      ...(data.openDrawerOnPrint !== undefined && { openDrawerOnPrint: data.openDrawerOnPrint }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    });
  }

  async deletePrinter(id: string) {
    await this.getPrinterById(id);
    await this.printerRepo.deletePrinter(id);
  }

  async testPrinter(id: string, ipAddress?: string, port = 9100) {
    let targetIp = ipAddress;
    let targetPort = port;

    if (id !== 'custom') {
      const printer = await this.getPrinterById(id);
      targetIp = printer.ipAddress || undefined;
      targetPort = printer.port || 9100;
    }

    if (!targetIp) throw new NotFoundError('Dirección IP no especificada para la prueba');
    const dummyBuffer = Buffer.from('Prueba de impresion poscocina\n\n\n\x1dV\x41\x00', 'binary');
    return await this.driver.sendToNetworkPrinter(targetIp, targetPort, dummyBuffer);
  }

  async openDrawer(printerId?: string) {
    if (!printerId) return { success: true, simulated: true };
    const printer = await this.getPrinterById(printerId);
    if (printer.connectionType === 'network_tcp' && printer.ipAddress?.trim()) {
      const kickCommand = Buffer.from('\x1Bp\x00\x19\xFA', 'binary');
      return await this.driver.sendToNetworkPrinter(printer.ipAddress, printer.port, kickCommand);
    }
    return { success: true, simulated: true };
  }
}
