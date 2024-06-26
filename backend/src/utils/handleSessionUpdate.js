import { eq } from "drizzle-orm";
import { sessions } from "../db/schema.js";

export default async function handleSessionUpdate({ db, userContact, data }) {
  await db.update(sessions).set(data).where(eq(sessions.contact, userContact));
}
