import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { NotFoundError } from '../../../errors/app-error.js';

export class CompanyRepository {
  constructor(private readonly database = db) {}

  async listAllCompanies() {
    const allCompanies = await this.database.select().from(schema.companies);
    const results = [];
    for (const c of allCompanies) {
      const companyVenues = await this.database
        .select({
          id: schema.venues.id,
          name: schema.venues.name,
          slug: schema.venues.slug,
          address: schema.venues.address,
          isPrimary: schema.venues.isPrimary,
          isActive: schema.venues.isActive,
        })
        .from(schema.venues)
        .where(eq(schema.venues.companyId, c.id));

      const [fiscal] = await this.database
        .select()
        .from(schema.companyFiscalSettings)
        .where(eq(schema.companyFiscalSettings.companyId, c.id))
        .limit(1);

      results.push({
        ...c,
        fiscal: fiscal || null,
        venues: companyVenues,
      });
    }
    return results;
  }

  async createCompanyWithInitialVenue(data: any) {
    return await this.database.transaction(async (tx) => {
      let baseSlug = data.slug
        ? data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
        : data.tradeName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
      if (!baseSlug) baseSlug = 'restaurante';

      const [existingSlug] = await tx
        .select({ id: schema.companies.id })
        .from(schema.companies)
        .where(eq(schema.companies.slug, baseSlug))
        .limit(1);

      const finalSlug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

      const [newCompany] = await tx
        .insert(schema.companies)
        .values({
          legalName: data.legalName.trim(),
          tradeName: data.tradeName.trim(),
          taxId: data.taxId.trim(),
          slug: finalSlug,
          primaryColor: data.primaryColor || '#ea580c',
          phone: data.phone || null,
          email: data.email ? data.email.toLowerCase().trim() : null,
          address: data.address || null,
        })
        .returning();

      await tx
        .insert(schema.companyFiscalSettings)
        .values({
          companyId: newCompany.id,
          regime: 'SIMPLIFICADO',
          taxType: 'INC_8',
          taxRate: 0.08,
          defaultTipPct: 10,
          currency: 'COP',
          isInvoiceResolutionEnabled: false,
          receiptHeader: 'Sabor tradicional & Alta cocina',
          receiptFooter: '¡Gracias por su visita!',
        })
        .onConflictDoNothing();

      const [primaryVenue] = await tx
        .insert(schema.venues)
        .values({
          companyId: newCompany.id,
          name: data.initialVenueName || 'Sede Principal',
          address: data.initialVenueAddress || data.address || 'Calle Principal',
          timezone: 'America/Bogota',
          isPrimary: true,
          isActive: true,
          settings: {
            currency: 'COP',
            tax_rate: 0.08,
            defaultTaxType: 'INC',
            defaultTaxRate: 0.08,
            defaultTipPct: 10,
            cashier_max_discount_pct: 10,
          },
        })
        .returning();

      return {
        ...newCompany,
        venues: [primaryVenue],
      };
    });
  }

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
        const [inserted] = await tx
          .insert(schema.companies)
          .values({
            legalName: data.legalName || 'Empresa',
            tradeName: data.tradeName || 'Restaurante',
            taxId: data.taxId || '900.000.000-1',
            logoUrl: data.logoUrl || null,
            primaryColor: data.primaryColor || '#ea580c',
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
          })
          .returning();
        company = inserted;
      } else if (Object.keys(companyUpdateFields).length > 1) {
        const [updated] = await tx
          .update(schema.companies)
          .set(companyUpdateFields)
          .where(eq(schema.companies.id, company.id))
          .returning();
        company = updated;
      }

      let fiscalResult = null;
      if (data.fiscal) {
        const fiscalFields: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        const f = data.fiscal;
        if (f.regime !== undefined) fiscalFields.regime = f.regime;
        if (f.taxType !== undefined) fiscalFields.taxType = f.taxType;
        if (f.taxRate !== undefined) fiscalFields.taxRate = f.taxRate;
        if (f.defaultTipPct !== undefined) fiscalFields.defaultTipPct = f.defaultTipPct;
        if (f.currency !== undefined) fiscalFields.currency = f.currency;
        if (f.isInvoiceResolutionEnabled !== undefined) {
          fiscalFields.isInvoiceResolutionEnabled = f.isInvoiceResolutionEnabled;
        }
        if (f.invoicePrefix !== undefined) fiscalFields.invoicePrefix = f.invoicePrefix;
        if (f.invoiceResolution !== undefined) fiscalFields.invoiceResolution = f.invoiceResolution;
        if (f.invoiceInitialNumber !== undefined) fiscalFields.invoiceInitialNumber = f.invoiceInitialNumber;
        if (f.invoiceFinalNumber !== undefined) fiscalFields.invoiceFinalNumber = f.invoiceFinalNumber;
        if (f.invoiceResolutionDate !== undefined) {
          fiscalFields.invoiceResolutionDate = f.invoiceResolutionDate ? new Date(f.invoiceResolutionDate) : null;
        }
        if (f.receiptHeader !== undefined) fiscalFields.receiptHeader = f.receiptHeader;
        if (f.receiptFooter !== undefined) fiscalFields.receiptFooter = f.receiptFooter;

        const [existingFiscal] = await tx
          .select()
          .from(schema.companyFiscalSettings)
          .where(eq(schema.companyFiscalSettings.companyId, company.id))
          .limit(1);

        if (existingFiscal) {
          const [updatedFiscal] = await tx
            .update(schema.companyFiscalSettings)
            .set(fiscalFields)
            .where(eq(schema.companyFiscalSettings.companyId, company.id))
            .returning();
          fiscalResult = updatedFiscal;
        } else {
          const [createdFiscal] = await tx
            .insert(schema.companyFiscalSettings)
            .values({
              companyId: company.id,
              ...fiscalFields,
            } as any)
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
