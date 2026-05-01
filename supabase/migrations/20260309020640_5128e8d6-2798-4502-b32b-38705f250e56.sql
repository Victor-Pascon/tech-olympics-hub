UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'joaovpascon@gmail.com' AND email_confirmed_at IS NULL;

-- DOWN
-- No down needed; this is a one-time data fix. Re-run would reconfirm email which is idempotent.