import { IPrinterRepository, IPrinterDriver } from '../interfaces/hardware.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';

export class PrintReceiptUseCase {
  constructor(
    private readonly printerRepo: IPrinterRepository,
    private readonly driver: IPrinterDriver
  ) {}

  async execute(receiptId: string) {
    const receipt = await this.printerRepo.findReceiptForPrint(receiptId);
    if (!receipt) throw new NotFoundError('Comprobante no encontrado');

    const venue = receipt.order?.venue;
    const printers = await this.printerRepo.findPrintersByVenue(receipt.order.venueId);
    const cashierPrinter = printers.find((p) => p.station === 'cashier') || printers[0];

    const paperWidth = (cashierPrinter?.paperWidth === '58' ? '58' : '80') as '58' | '80';
    const venueSettings = (venue?.settings as Record<string, any>) || {};

    const { escposBuffer, asciiPreview } = this.driver.generateReceiptTicket({
      companyName: venue?.name || 'Mi Restaurante',
      taxId: venueSettings.taxId || 'NIT: 900.000.000-1',
      address: venueSettings.address || venue?.address,
      phone: venueSettings.phone,
      receiptNumber: String(receipt.receiptNumber),
      tableLabel: receipt.order?.table?.label,
      waiterName: receipt.order?.waiter?.name,
      customerName: receipt.customer?.name,
      customerDoc: receipt.customer?.documentNumber,
      loyaltyPoints: receipt.customer?.loyaltyPoints,
      issuedAt: receipt.issuedAt || receipt.createdAt,
      paperWidth,
      subtotal: parseFloat(receipt.subtotal),
      taxTotal: parseFloat(receipt.taxTotal),
      discountTotal: parseFloat(receipt.discountTotal),
      total: parseFloat(receipt.total),
      openDrawer: cashierPrinter?.openDrawerOnPrint,
      items: (receipt.order?.items || []).map((i: any) => ({
        quantity: i.quantity,
        productName: i.product?.name || 'Producto',
        unitPrice: parseFloat(i.unitPrice),
        total: parseFloat(i.unitPrice) * i.quantity,
      })),
      payments: (receipt.payments || []).map((p: any) => ({
        method: p.method,
        amount: parseFloat(p.amount),
        tipAmount: parseFloat(p.tipAmount),
      })),
      footerText: venueSettings.receiptFooter || '¡Gracias por su visita!',
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
      paperWidth,
      networkSent,
      networkError,
      asciiPreview,
    };
  }
}
