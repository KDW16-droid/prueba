import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("publishes the Melius Time product metadata", async () => {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");

  assert.match(layout, /Melius Time \| Reloj checador/);
  assert.match(layout, /<html lang="es">/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
});

test("includes employee and authorization workflows", async () => {
  const panel = await readFile(new URL("app/ui/panel-app.tsx", root), "utf8");

  assert.match(panel, /Registrar entrada/);
  assert.match(panel, /Iniciar pausa/);
  assert.match(panel, /Salida provisional/);
  assert.match(panel, /Autorizar/);
  assert.match(panel, /Exportar Excel/);
});

test("keeps PostgreSQL migrations under version control", async () => {
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const firstMigration = await readFile(
    new URL("drizzle/0000_normal_iron_lad.sql", root),
    "utf8",
  );

  assert.match(schema, /pgTable/);
  assert.match(firstMigration, /CREATE TABLE "workdays"/);
  assert.match(firstMigration, /CREATE TABLE "audit_events"/);
});
