import { IPrinterRepository, IPrinterDriver } from '../interfaces/hardware.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';

export class PrintPreCheckUseCase {
  constructor(
    private readonly printerRepo: IPrinterRepository,
    private readonly driver: IPrinterDriver
  ) {}

  async execute(orderId: string) {
    const order = await this.printerRepo.findOrderForPrint(orderId);
    if (!order) throw new NotFoundError('Comanda no encontrada');

    const venue = order.venue;
    const printers = await this.printerRepo.findPrintersByVenue(order.venueId);
    const cashierPrinter = printers.find((p) => p.station === 'cashier') || printers[0];
    const venueSettings = (venue?.settings as Record<string, any>) || {};
    const paperWidth = ((cashierPrinter?.paperWidth || venueSettings.paperWidth || '80') === '58' ? '58' : '80') as '58' | '80';

    const total = parseFloat(order.total);
    const subtotal = parseFloat(order.subtotal);
    const taxTotal = parseFloat(order.taxTotal);
    const suggestedTip = Math.round(total * 0.1);

    const { escposBuffer, asciiPreview } = this.driver.generatePreCheckTicket({
      companyName: venueSettings.companyName || venue?.name || 'Mi Restaurante',
      tableLabel: order.table?.label,
      waiterName: venueSettings.showWaiterOnReceipt !== false ? order.waiter?.name : undefined,
      subtotal,
      taxTotal,
      total,
      suggestedTip,
      totalWithTip: total + suggestedTip,
      paperWidth,
      footerText: venueSettings.receiptFooter,
      items: (order.items || []).map((i: any) => ({
        quantity: i.quantity,
        productName: i.product?.name || 'Producto',
        total: parseFloat(i.unitPrice) * i.quantity,
      })),
    });

    let networkSent = false;
    let networkError: string | undefined;

    if (cashierPrinter?.connectionType === 'network_tcp' && cashierPrinter.ipAddress?.trim()) {
      const sendResult = await this.driver.sendToNetworkPrinter(cashierPrinter.ipAddress, cashierPrinter.port, escposBuffer);
      networkSent = sendResult.success;
      networkError = sendResult.error;
    }

    return {
      printerId: cashierPrinter?.id,
      printerName: cashierPrinter?.name || 'Caja Virtual',
      connectionType: cashierPrinter?.connectionType || 'network_tcp',
      ipAddress: cashierPrinter?.ipAddress,
      paperWidth,
      networkSent,
      networkError,
      asciiPreview,
      rawEscposBase64: escposBuffer.toString('base64'),
    };
  }
}
