ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "guest_name" varchar(150);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "model_3d_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "model_3d_type" varchar(30) DEFAULT 'glb';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "dimensions" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "display_media" varchar(20) DEFAULT 'both';