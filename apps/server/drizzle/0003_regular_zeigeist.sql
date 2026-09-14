ALTER TABLE "products" ALTER COLUMN "tax_rate" SET DEFAULT '0.08';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "token_version" smallint DEFAULT 1 NOT NULL;