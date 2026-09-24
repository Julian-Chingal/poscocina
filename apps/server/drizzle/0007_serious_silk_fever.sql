CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_name" varchar(150) NOT NULL,
	"trade_name" varchar(150) NOT NULL,
	"tax_id" varchar(50) NOT NULL,
	"logo_url" text,
	"primary_color" varchar(10) DEFAULT '#ea580c' NOT NULL,
	"phone" varchar(50),
	"email" varchar(150),
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "company_fiscal_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"regime" varchar(40) DEFAULT 'SIMPLIFICADO' NOT NULL,
	"tax_type" varchar(20) DEFAULT 'INC_8' NOT NULL,
	"tax_rate" real DEFAULT 0.08 NOT NULL,
	"default_tip_pct" real DEFAULT 10 NOT NULL,
	"currency" varchar(10) DEFAULT 'COP' NOT NULL,
	"invoice_prefix" varchar(20),
	"invoice_resolution" varchar(100),
	"invoice_initial_number" integer,
	"invoice_final_number" integer,
	"invoice_resolution_date" timestamp with time zone,
	"receipt_header" text DEFAULT 'Sabor tradicional & Alta cocina' NOT NULL,
	"receipt_footer" text DEFAULT '¡Gracias por su visita!' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_fiscal_settings_company_id_unique" UNIQUE("company_id")
);

ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "company_id" uuid;

DO $$ BEGIN
  ALTER TABLE "company_fiscal_settings" ADD CONSTRAINT "company_fiscal_settings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "venues" ADD CONSTRAINT "venues_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Inicializar Company y Fiscal Settings con los datos existentes de la sede principal
DO $$
DECLARE
  v_main_venue RECORD;
  v_company_id uuid;
  v_settings jsonb;
  v_legal_name varchar;
  v_trade_name varchar;
  v_tax_id varchar;
  v_logo_url text;
  v_primary_color varchar;
  v_phone varchar;
  v_tax_rate real;
  v_tax_type varchar;
  v_tip_pct real;
  v_currency varchar;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "companies") THEN
    SELECT * INTO v_main_venue FROM "venues" WHERE "is_primary" = true LIMIT 1;
    IF v_main_venue.id IS NULL THEN
      SELECT * INTO v_main_venue FROM "venues" ORDER BY "created_at" ASC LIMIT 1;
    END IF;

    IF v_main_venue.id IS NOT NULL THEN
      v_settings := COALESCE(v_main_venue.settings, '{}'::jsonb);
      v_legal_name := COALESCE(v_settings->>'companyName', v_main_venue.name, 'poscocina S.A.S.');
      v_trade_name := COALESCE(v_main_venue.name, 'poscocina');
      v_tax_id := COALESCE(v_settings->>'taxId', '900.123.456-7');
      v_logo_url := v_settings->>'logoUrl';
      v_primary_color := COALESCE(v_settings->>'primaryColor', '#ea580c');
      v_phone := COALESCE(v_settings->>'phone', '+57 300 123 4567');
      v_tax_rate := COALESCE((v_settings->>'taxRate')::real, 0.08);
      v_tax_type := COALESCE(v_settings->>'taxType', 'INC_8');
      v_tip_pct := COALESCE((v_settings->>'defaultTipPct')::real, 10);
      v_currency := COALESCE(v_settings->>'currency', 'COP');

      INSERT INTO "companies" ("legal_name", "trade_name", "tax_id", "logo_url", "primary_color", "phone", "address")
      VALUES (v_legal_name, v_trade_name, v_tax_id, v_logo_url, v_primary_color, v_phone, v_main_venue.address)
      RETURNING "id" INTO v_company_id;

      INSERT INTO "company_fiscal_settings" ("company_id", "regime", "tax_type", "tax_rate", "default_tip_pct", "currency")
      VALUES (v_company_id, 'SIMPLIFICADO', v_tax_type, v_tax_rate, v_tip_pct, v_currency);

      UPDATE "venues" SET "company_id" = v_company_id WHERE "company_id" IS NULL;
    END IF;
  END IF;
END $$;