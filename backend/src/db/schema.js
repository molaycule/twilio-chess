import { boolean, pgTable, serial, text } from "drizzle-orm/pg-core";
import constants from "../constants/index.js";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  setup: text("setup").default("clean"),
  medium: text("medium").default("whatsapp"),
  contact: text("contact").notNull().unique(),
  fen: text("fen").notNull().default(constants.defaultFEN),
  locked: boolean("locked").notNull().default(false)
});
