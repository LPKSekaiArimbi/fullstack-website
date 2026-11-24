import postgres from "postgres";
import { readFile } from "node:fs/promises";
if (!process.env.DATABASE_URL) throw Error("Isi DATABASE_URL terlebih dahulu.");
const db = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await db.begin(async (tx) => {
    await tx.unsafe(
      await readFile(new URL("schema.sql", import.meta.url), "utf8"),
    );
  });
  console.log("Skema database siap.");
} finally {
  await db.end();
}
