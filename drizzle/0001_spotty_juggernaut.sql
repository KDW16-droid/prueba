DROP INDEX "user_roles_scope_uq";--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_global_uq" ON "user_roles" USING btree ("user_id","role") WHERE "user_roles"."company_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_company_uq" ON "user_roles" USING btree ("user_id","role","company_id") WHERE "user_roles"."company_id" is not null;