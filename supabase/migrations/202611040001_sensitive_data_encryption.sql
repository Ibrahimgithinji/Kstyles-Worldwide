BEGIN;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_lookup text;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS email_lookup text;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lookup_unique
  ON public.users (email_lookup);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_lookup_unique
  ON public.subscribers (email_lookup);

COMMIT;
