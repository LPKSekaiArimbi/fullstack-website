CREATE TABLE IF NOT EXISTS registrations (
 id uuid PRIMARY KEY,
 full_name text NOT NULL,
 whatsapp text NOT NULL,
 domicile text NOT NULL,
 status text NOT NULL DEFAULT 'Baru' CHECK(status IN ('Baru','Dihubungi','Diterima')),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS nik text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS kk_number text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS birth_place text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS religion text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS marital_status text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ktp_address text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS domicile_address text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS school_name text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS graduation_year integer;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS height_cm integer;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS weight_kg integer;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS blood_type text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS eye_minus text;
CREATE TABLE IF NOT EXISTS registration_documents (
 document_id uuid PRIMARY KEY,
 registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
 document_type text NOT NULL CHECK(document_type IN ('ktp','kartu_keluarga','akta_kelahiran','ijazah','pas_foto','surat_izin_orang_tua','skck','kartu_kuning')),
 file_name text NOT NULL,
 content_type text NOT NULL,
 file_size integer NOT NULL CHECK(file_size > 0 AND file_size <= 1000000),
 file_data bytea NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS registration_order ON registrations (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS registration_document_order ON registration_documents (registration_id);
CREATE TABLE IF NOT EXISTS admin_sessions (digest text PRIMARY KEY, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS login_attempts (bucket text PRIMARY KEY, starts_at timestamptz NOT NULL, attempts integer NOT NULL);
