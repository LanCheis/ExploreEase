-- FR-07 retroactive fixes (discovered during FR-11 testing)
--
-- Fix 1: reviews.user_id FK now references profiles(id) instead of auth.users(id).
--   PostgREST only discovers relationships from FKs in the public schema.
--   The old FK pointed to auth.users (hidden schema), so PostgREST couldn't resolve
--   the reviews -> profiles embedding and returned empty arrays.
--
-- Fix 2: update_place_rating() gains SECURITY DEFINER.
--   Without it the trigger runs as the session user, who has no UPDATE RLS policy
--   on places. The UPDATE silently affected 0 rows, leaving places.rating as null.

-- ============================================================
-- Fix 1: re-point FK to profiles(id)
-- ============================================================
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================
-- Fix 2: rebuild trigger function with SECURITY DEFINER
-- (CREATE OR REPLACE is enough — the trigger itself stays in place)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_place_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_place_id uuid;
BEGIN
  target_place_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.place_id ELSE NEW.place_id END;

  UPDATE public.places
  SET rating = (
    SELECT AVG(r.rating)
    FROM public.reviews r
    WHERE r.place_id = target_place_id AND r.is_flagged = false
  )
  WHERE id = target_place_id;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;
