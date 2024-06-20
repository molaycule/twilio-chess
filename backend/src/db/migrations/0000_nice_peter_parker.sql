CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"setup" text DEFAULT 'clean',
	"medium" text DEFAULT 'whatsapp',
	"contact" text NOT NULL,
	CONSTRAINT "sessions_contact_unique" UNIQUE("contact")
);
