CREATE TABLE "driver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone" varchar(30) NOT NULL,
	"document_type" varchar(20) DEFAULT 'CC' NOT NULL,
	"document_number" varchar(50) NOT NULL,
	"city" varchar(80) DEFAULT 'Popayán' NOT NULL,
	"vehicle_type" varchar(30) DEFAULT 'motorcycle' NOT NULL,
	"license_plate" varchar(20),
	"status" varchar(20) DEFAULT 'offline' NOT NULL,
	"trust_tier" smallint DEFAULT 1 NOT NULL,
	"credit_limit" numeric(12, 2) DEFAULT '15000.00' NOT NULL,
	"wallet_balance" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_earnings" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"completed_deliveries" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '5.00',
	"current_lat" numeric(10, 7),
	"current_lng" numeric(10, 7),
	"payout_method" varchar(30) DEFAULT 'nequi',
	"payout_account" varchar(60),
	"is_verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "driver_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "driver_wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_profile_id" uuid NOT NULL,
	"order_id" uuid,
	"type" varchar(40) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"balance_after" numeric(12, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"driver_id" uuid,
	"total_amount" numeric(12, 2) NOT NULL,
	"food_subtotal" numeric(12, 2) NOT NULL,
	"delivery_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"restaurant_share" numeric(12, 2) NOT NULL,
	"driver_share" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"platform_share" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"collected_by" varchar(20) DEFAULT 'platform' NOT NULL,
	"settlement_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"settled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_settlements_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_pin" varchar(10);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "driver_payout" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "platform_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "dispatch_status" varchar(30) DEFAULT 'unassigned' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "claimed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "picked_up_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_driver_profile_id_driver_profiles_id_fk" FOREIGN KEY ("driver_profile_id") REFERENCES "public"."driver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_settlements" ADD CONSTRAINT "order_settlements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_settlements" ADD CONSTRAINT "order_settlements_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_settlements" ADD CONSTRAINT "order_settlements_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;