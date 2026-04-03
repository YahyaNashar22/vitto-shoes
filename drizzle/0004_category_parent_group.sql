DO $$ BEGIN
 CREATE TYPE "public"."category_parent_group" AS ENUM('men', 'women', 'kids');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "parent_group" "category_parent_group" DEFAULT 'women' NOT NULL;
