import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
export const hasDb = !!process.env.DATABASE_URL;
export const db = drizzle(
  neon(process.env.DATABASE_URL ?? "postgres://u:p@localhost/db"),
  { schema, casing: "snake_case" },
);
