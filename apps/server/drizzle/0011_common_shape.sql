ALTER TABLE "orders" ADD COLUMN "guest_name" varchar(150);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "model_3d_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "model_3d_type" varchar(30) DEFAULT 'glb';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "dimensions" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "display_media" varchar(20) DEFAULT 'both';