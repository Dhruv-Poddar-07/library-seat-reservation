-- Disable email confirmation requirement for development
-- This allows users to sign in immediately without confirming their email
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT now();

-- Update existing unconfirmed users to be confirmed
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
