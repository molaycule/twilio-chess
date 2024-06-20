import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  setup: text("setup").default("clean"),
  medium: text("medium").default("whatsapp"),
  contact: text("contact").notNull().unique()
});
