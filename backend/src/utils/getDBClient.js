import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema.js";

export default function getDBClient() {
  const sql = neon(process.env.DATABASE_CONN_STRING);
  const db = drizzle(sql, { schema });
  return db;
}
