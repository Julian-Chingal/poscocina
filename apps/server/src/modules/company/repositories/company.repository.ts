import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { NotFoundError } from '../../../errors/app-error.js';

export class CompanyRepository {
  constructor(private readonly database = db) {}

  async getCompanyWithFiscal() {
    const [company] = await this.database.select().from(schema.companies).limit(1);
    if (!company) {
      throw new NotFoundError('No se encontró información corporativa registrada');
    }

    const [fiscal] = await this.database
      .select()
      .from(schema.companyFiscalSettings)
      .where(eq(schema.companyFiscalSettings.companyId, company.id))
      .limit(1);

    return {
      ...company,
      fiscal: fiscal || null,
    };
  }

  async getFiscalSettings() {
    const [fiscal] = await this.database.select().from(schema.companyFiscalSettings).limit(1);
    if (!fiscal) {
      // Fallback a valores estándar
      return {
        regime: 'SIMPLIFICADO',
        taxType: 'INC_8',
        taxRate: 0.08,
        defaultTipPct: 10,
        currency: 'COP',
        isInvoiceResolutionEnabled: false,
        receiptHeader: 'Sabor tradicional & Alta cocina',
        receiptFooter: '¡Gracias por su visita!',
      };
    }
    return fiscal;
  }

  async updateCompanyWithFiscal(data: any) {
    return await this.database.transaction(async (tx) => {
      let [company] = await tx.select().from(schema.companies).limit(1);

      const companyUpdateFields: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (data.legalName !== undefined) companyUpdateFields.legalName = data.legalName;
      if (data.tradeName !== undefined) companyUpdateFields.tradeName = data.tradeName;
      if (data.taxId !== undefined) companyUpdateFields.taxId = data.taxId;
      if (data.logoUrl !== undefined) companyUpdateFields.logoUrl = data.logoUrl;
      if (data.primaryColor !== undefined) companyUpdateFields.primaryColor = data.primaryColor;
      if (data.phone !== undefined) companyUpdateFields.phone = data.phone;
      if (data.email !== undefined) companyUpdateFields.email = data.email;
      if (data.address !== undefined) companyUpdateFields.address = data.address;

      if (!company) {
        const [created] = await tx
          .insert(schema.companies)
          .values({
            legalName: data.legalName || 'poscocina S.A.S.',
            tradeName: data.tradeName || 'poscocina',
            taxId: data.taxId || '900.123.456-7',
            logoUrl: data.logoUrl,
            primaryColor: data.primaryColor || '#ea580c',
            phone: data.phone,
            email: data.email,
            address: data.address,
          })
          .returning();
        company = created;
      } else {
        const [updated] = await tx
          .update(schema.companies)
          .set(companyUpdateFields)
          .where(eq(schema.companies.id, company.id))
          .returning();
        company = updated;
      }

      let fiscalResult = null;
      if (data.fiscal) {
        const fiscalUpdateFields: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        if (data.fiscal.regime !== undefined) fiscalUpdateFields.regime = data.fiscal.regime;
        if (data.fiscal.taxType !== undefined) fiscalUpdateFields.taxType = data.fiscal.taxType;
        if (data.fiscal.taxRate !== undefined) fiscalUpdateFields.taxRate = Number(data.fiscal.taxRate);
        if (data.fiscal.defaultTipPct !== undefined) fiscalUpdateFields.defaultTipPct = Number(data.fiscal.defaultTipPct);
        if (data.fiscal.currency !== undefined) fiscalUpdateFields.currency = data.fiscal.currency;
        if (data.fiscal.isInvoiceResolutionEnabled !== undefined) {
          fiscalUpdateFields.isInvoiceResolutionEnabled = Boolean(data.fiscal.isInvoiceResolutionEnabled);
        }
        if (data.fiscal.invoicePrefix !== undefined) fiscalUpdateFields.invoicePrefix = data.fiscal.invoicePrefix;
        if (data.fiscal.invoiceResolution !== undefined) fiscalUpdateFields.invoiceResolution = data.fiscal.invoiceResolution;
        if (data.fiscal.invoiceInitialNumber !== undefined) fiscalUpdateFields.invoiceInitialNumber = data.fiscal.invoiceInitialNumber;
        if (data.fiscal.invoiceFinalNumber !== undefined) fiscalUpdateFields.invoiceFinalNumber = data.fiscal.invoiceFinalNumber;
        if (data.fiscal.invoiceResolutionDate !== undefined) {
          fiscalUpdateFields.invoiceResolutionDate = data.fiscal.invoiceResolutionDate ? new Date(data.fiscal.invoiceResolutionDate) : null;
        }
        if (data.fiscal.receiptHeader !== undefined) fiscalUpdateFields.receiptHeader = data.fiscal.receiptHeader;
        if (data.fiscal.receiptFooter !== undefined) fiscalUpdateFields.receiptFooter = data.fiscal.receiptFooter;

        const [existingFiscal] = await tx
          .select()
          .from(schema.companyFiscalSettings)
          .where(eq(schema.companyFiscalSettings.companyId, company.id))
          .limit(1);

        if (existingFiscal) {
          const [updatedFiscal] = await tx
            .update(schema.companyFiscalSettings)
            .set(fiscalUpdateFields)
            .where(eq(schema.companyFiscalSettings.companyId, company.id))
            .returning();
          fiscalResult = updatedFiscal;
        } else {
          const [createdFiscal] = await tx
            .insert(schema.companyFiscalSettings)
            .values({
              companyId: company.id,
              regime: data.fiscal.regime || 'SIMPLIFICADO',
              taxType: data.fiscal.taxType || 'INC_8',
              taxRate: Number(data.fiscal.taxRate ?? 0.08),
              defaultTipPct: Number(data.fiscal.defaultTipPct ?? 10),
              currency: data.fiscal.currency || 'COP',
              isInvoiceResolutionEnabled: Boolean(data.fiscal.isInvoiceResolutionEnabled ?? false),
              invoicePrefix: data.fiscal.invoicePrefix,
              invoiceResolution: data.fiscal.invoiceResolution,
              invoiceInitialNumber: data.fiscal.invoiceInitialNumber,
              invoiceFinalNumber: data.fiscal.invoiceFinalNumber,
              invoiceResolutionDate: data.fiscal.invoiceResolutionDate ? new Date(data.fiscal.invoiceResolutionDate) : null,
              receiptHeader: data.fiscal.receiptHeader || 'Sabor tradicional & Alta cocina',
              receiptFooter: data.fiscal.receiptFooter || '¡Gracias por su visita!',
            })
            .returning();
          fiscalResult = createdFiscal;
        }
      } else {
        const [existingFiscal] = await tx
          .select()
          .from(schema.companyFiscalSettings)
          .where(eq(schema.companyFiscalSettings.companyId, company.id))
          .limit(1);
        fiscalResult = existingFiscal || null;
      }

      return {
        ...company,
        fiscal: fiscalResult,
      };
    });
  }
}

export const companyRepository = new CompanyRepository();
