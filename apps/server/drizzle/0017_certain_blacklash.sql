CREATE TABLE "whatsapp_chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"phone" varchar(30) NOT NULL,
	"customer_id" uuid,
	"customer_name" varchar(150),
	"last_message" text,
	"last_message_at" timestamp with time zone DEFAULT now(),
	"unread_count" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"waha_message_id" varchar(100),
	"direction" varchar(10) NOT NULL,
	"body" text NOT NULL,
	"media_url" text,
	"media_type" varchar(50),
	"status" varchar(20) DEFAULT 'received',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "otp_code_hash" varchar(72);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "otp_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "token_version" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "driver_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_pin" varchar(10);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "transfer_proof_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_confirmed_by" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "whatsapp_chats" ADD CONSTRAINT "whatsapp_chats_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_chats" ADD CONSTRAINT "whatsapp_chats_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_chat_id_whatsapp_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."whatsapp_chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "venue_phone_idx" ON "whatsapp_chats" USING btree ("venue_id","phone");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_confirmed_by_users_id_fk" FOREIGN KEY ("payment_confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;