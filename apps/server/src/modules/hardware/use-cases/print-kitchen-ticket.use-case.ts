import { IPrinterRepository, IPrinterDriver } from '../interfaces/hardware.interface.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';

export class PrintKitchenTicketUseCase {
  constructor(
    private readonly printerRepo: IPrinterRepository,
    private readonly driver: IPrinterDriver
  ) {}

  async execute(orderId: string, options?: { specificStation?: string; isAppend?: boolean }) {
    const order = await this.printerRepo.findOrderForPrint(orderId);
    if (!order) throw new NotFoundError('Comanda no encontrada');

    const printers = await this.printerRepo.findPrintersByVenue(order.venueId);
    const stationItemsMap: Record<string, any[]> = {};

    for (const it of order.items || []) {
      const station = it.product?.printerStation || 'kitchen';
      if (options?.specificStation && station !== options.specificStation) continue;
      if (!stationItemsMap[station]) stationItemsMap[station] = [];
      stationItemsMap[station].push({
        quantity: it.quantity,
        productName: it.product?.name || 'Producto',
        notes: it.notes,
      });
    }

    const results = [];
    for (const [station, items] of Object.entries(stationItemsMap)) {
      if (items.length === 0) continue;
      const printer = printers.find((p) => p.station === station) || printers.find((p) => p.station === 'kitchen');
      const paperWidth = (printer?.paperWidth === '58' ? '58' : '80') as '58' | '80';
      const stationDisplayName = station === 'bar' ? 'BARRA / BEBIDAS' : station === 'dessert' ? 'POSTRES / CAFE' : 'COCINA CALIENTE';

      const { escposBuffer, asciiPreview } = this.driver.generateKitchenTicket({
        stationName: stationDisplayName,
        orderId: order.id,
        tableLabel: order.table?.label,
        waiterName: order.waiter?.name,
        openedAt: order.openedAt,
        notes: order.notes,
        isAppend: options?.isAppend,
        paperWidth,
        items,
      });

      let networkSent = false;
      let networkError: string | undefined;

      if (printer?.connectionType === 'network_tcp' && printer.ipAddress?.trim()) {
        const sendResult = await this.driver.sendToNetworkPrinter(printer.ipAddress, printer.port, escposBuffer);
        networkSent = sendResult.success;
        networkError = sendResult.error;
      }

      results.push({
        station,
        printerId: printer?.id,
        printerName: printer?.name || 'Virtual / Fallback',
        paperWidth,
        networkSent,
        networkError,
        asciiPreview,
      });
    }

    return results;
  }
}
