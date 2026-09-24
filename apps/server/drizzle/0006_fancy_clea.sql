ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "is_primary" boolean DEFAULT false NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "venues" WHERE "is_primary" = true) THEN
    UPDATE "venues"
    SET "is_primary" = true
    WHERE id = (SELECT id FROM "venues" ORDER BY "created_at" ASC LIMIT 1);
  END IF;
END $$;