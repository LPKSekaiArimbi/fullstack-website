CREATE TABLE IF NOT EXISTS registrations (
 id uuid PRIMARY KEY,
 full_name text NOT NULL,
 whatsapp text NOT NULL,
 domicile text NOT NULL,
 status text NOT NULL DEFAULT 'Baru' CHECK(status IN ('Baru','Dihubungi','Diterima')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS registration_order ON registrations (created_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS admin_sessions (digest text PRIMARY KEY, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS login_attempts (bucket text PRIMARY KEY, starts_at timestamptz NOT NULL, attempts integer NOT NULL);
