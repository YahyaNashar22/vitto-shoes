ALTER TABLE "order_item" ADD COLUMN "selected_barcode" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "selected_x_dim" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "selected_y_dim" text DEFAULT '' NOT NULL;