import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { fundingSources } from "./schema";

async function seed() {
  const db = drizzle(sql);

  console.log("🌱 Seeding funding sources...");

  await db.insert(fundingSources).values([
    { nombre: "TC Amex", tipo: "tarjeta_credito", activo: true },
    { nombre: "TC Visa Juan P", tipo: "tarjeta_credito", activo: true },
    { nombre: "TC Visa Hillary", tipo: "tarjeta_credito", activo: true },
    { nombre: "Dinero Golden", tipo: "efectivo_propio", activo: true },
    { nombre: "Dinero Page", tipo: "efectivo_propio", activo: true },
  ]);

  console.log("✅ Seed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
