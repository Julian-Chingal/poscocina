ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "slug" varchar(120);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "venues" ADD CONSTRAINT "venues_slug_unique" UNIQUE ("slug");
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN duplicate_table THEN null;
END $$;
