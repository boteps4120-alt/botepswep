-- 1. First create the manager account through the BOTEPS signup screen
--    or Supabase Dashboard > Authentication > Users > Add user.
-- 2. Replace the email below with the manager account email.
-- 3. Run this in Supabase SQL Editor.

update public.profiles
set role = 'admin',
    updated_at = now()
where email = 'manager@boteps.test';

select id, email, display_name, role
from public.profiles
where email = 'manager@boteps.test';
