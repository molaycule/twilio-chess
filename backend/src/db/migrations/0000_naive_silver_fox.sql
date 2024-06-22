CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"setup" text DEFAULT 'clean',
	"medium" text DEFAULT 'whatsapp',
	"contact" text NOT NULL,
	"fen" text DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' NOT NULL,
	CONSTRAINT "sessions_contact_unique" UNIQUE("contact")
);
