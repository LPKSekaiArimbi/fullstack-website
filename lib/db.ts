import "server-only";
import postgres from "postgres";
let db: ReturnType<typeof postgres> | undefined;
export function sql() {
  if (!process.env.DATABASE_URL)
    throw new Error("Database belum dikonfigurasi.");
  return (db ??= postgres(process.env.DATABASE_URL, {
    max: 2,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 8,
  }));
}
