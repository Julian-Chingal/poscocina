ALTER TYPE "public"."table_status" ADD VALUE 'maintenance';--> statement-breakpoint
CREATE TABLE "order_item_stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"station_id" uuid NOT NULL,
	"status" "item_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone,
	"ready_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_stations" (
	"product_id" uuid NOT NULL,
	"station_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "product_stations_product_id_station_id_pk" PRIMARY KEY("product_id","station_id")
);
--> statement-breakpoint
CREATE TABLE "workstations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT '#ea580c' NOT NULL,
	"icon" varchar(50) DEFAULT 'ChefHat' NOT NULL,
	"printer_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_item_stations" ADD CONSTRAINT "order_item_stations_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_stations" ADD CONSTRAINT "order_item_stations_station_id_workstations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."workstations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stations" ADD CONSTRAINT "product_stations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stations" ADD CONSTRAINT "product_stations_station_id_workstations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."workstations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_printer_id_printers_id_fk" FOREIGN KEY ("printer_id") REFERENCES "public"."printers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "order_item_station_unique_idx" ON "order_item_stations" USING btree ("order_item_id","station_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workstations_venue_code_idx" ON "workstations" USING btree ("venue_id","code");