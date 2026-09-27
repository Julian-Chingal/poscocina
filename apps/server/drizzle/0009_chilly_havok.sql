ALTER TYPE "public"."table_status" ADD VALUE IF NOT EXISTS 'paid_waiting_food' BEFORE 'reserved';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_status" varchar(30) DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "kitchen_status" varchar(30) DEFAULT 'queued' NOT NULL;