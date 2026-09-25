ALTER TYPE "public"."table_status" ADD VALUE 'paid_waiting_food' BEFORE 'reserved';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" varchar(30) DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "kitchen_status" varchar(30) DEFAULT 'queued' NOT NULL;