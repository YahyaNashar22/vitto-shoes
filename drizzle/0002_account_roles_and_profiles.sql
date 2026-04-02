ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'customer' NOT NULL;
ALTER TABLE "user" ADD COLUMN "phone" text DEFAULT '' NOT NULL;
ALTER TABLE "user" ADD COLUMN "city" text DEFAULT '' NOT NULL;
ALTER TABLE "user" ADD COLUMN "address" text DEFAULT '' NOT NULL;
