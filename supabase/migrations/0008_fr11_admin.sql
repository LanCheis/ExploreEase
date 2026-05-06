-- FR-11 Admin Dashboard
-- Adds: is_current_user_admin() helper, profiles.is_admin, events.status, RLS policy additions.

-- ============================================================
-- profiles: is_admin column (must exist before the function below references it)
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;

-- ============================================================
-- SECURITY DEFINER helper
-- Reads profiles.is_admin without triggering recursive RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Admins can SELECT all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_current_user_admin());

-- Admins can UPDATE any profile (needed for is_admin toggle)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- ============================================================
-- events: status column
-- ============================================================
ALTER TABLE public.events ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Backfill: seed events were created by a developer/admin; treat as approved.
UPDATE public.events SET status = 'approved';

ALTER TABLE public.events ADD CONSTRAINT events_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Drop the old unrestricted public SELECT policy from FR-05.
-- Common names Supabase generates — drop all candidates so this is idempotent.
DROP POLICY IF EXISTS "events_select_public"          ON public.events;
DROP POLICY IF EXISTS "events are publicly readable"  ON public.events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;

-- New SELECT: public sees only approved events; admins see all.
-- (No user_id on events table, so there is no "own events" concept yet.)
CREATE POLICY "events_select_approved_or_admin"
  ON public.events FOR SELECT
  USING (
    status = 'approved'
    OR public.is_current_user_admin()
  );

-- Admins can UPDATE any event (approve / reject / edit)
CREATE POLICY "events_update_admin"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin());

-- Admins can DELETE any event
CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

-- ============================================================
-- reviews: admin sees all (including flagged) + can delete any
-- ============================================================

-- Replace existing public SELECT that hides flagged reviews.
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;

CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (
    is_flagged = false
    OR public.is_current_user_admin()
  );

-- Admins can DELETE any review
CREATE POLICY "reviews_delete_admin"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

-- ============================================================
-- itineraries: admin SELECT (needed for analytics count)
-- ============================================================
CREATE POLICY "itineraries_select_admin"
  ON public.itineraries FOR SELECT
  USING (public.is_current_user_admin());

-- ============================================================
-- Analytics RPC
-- Returns counts + top 5 places by review count in one round-trip.
-- SECURITY DEFINER so it can count across all rows regardless of RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users',            (SELECT count(*)::int FROM profiles),
    'total_events_pending',   (SELECT count(*)::int FROM events WHERE status = 'pending'),
    'total_events_approved',  (SELECT count(*)::int FROM events WHERE status = 'approved'),
    'total_events_rejected',  (SELECT count(*)::int FROM events WHERE status = 'rejected'),
    'total_reviews',          (SELECT count(*)::int FROM reviews),
    'total_places',           (SELECT count(*)::int FROM places),
    'total_itineraries',      (SELECT count(*)::int FROM itineraries),
    'top_places', (
      SELECT COALESCE(json_agg(t), '[]'::json)
      FROM (
        SELECT p.name, count(r.id)::int AS review_count
        FROM places p
        LEFT JOIN reviews r ON r.place_id = p.id
        GROUP BY p.id, p.name
        ORDER BY review_count DESC
        LIMIT 5
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$;
