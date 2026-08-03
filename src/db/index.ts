import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

/**
 * Safe DB initialization.
 * If DATABASE_URL is not set, we still create a client pointing to a placeholder
 * so that the module loads without errors. The isDbConfigured() check should be
 * called before any query to avoid runtime errors.
 */
function createDb() {
  const connectionString = databaseUrl || "postgresql://placeholder:placeholder@localhost/placeholder";
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export const db = createDb();

/** Check if DATABASE_URL is configured */
export function isDbConfigured(): boolean {
  return !!databaseUrl;
}
