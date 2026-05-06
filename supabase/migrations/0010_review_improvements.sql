-- Review improvements:
--   1. One review per user per place (UNIQUE constraint)
--   2. Users can edit and delete their own reviews
--   3. Flag review via SECURITY DEFINER RPC (non-admins were blocked by RLS)
--   4. Admin unflag RPC
--   5. Review replies table

-- ============================================================
-- 1. One review per user per place
-- ============================================================
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_unique_user_place UNIQUE (user_id, place_id);

-- ============================================================
-- 2. Users may edit and delete their own reviews
-- ============================================================
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 3. Safe flag RPC — runs as owner, prevents self-flagging
-- ============================================================
CREATE OR REPLACE FUNCTION public.flag_review(p_review_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.reviews
  SET is_flagged = true
  WHERE id = p_review_id
    AND user_id != auth.uid()
    AND NOT is_flagged;
$$;

-- ============================================================
-- 4. Admin unflag RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.unflag_review(p_review_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.reviews SET is_flagged = false WHERE id = p_review_id;
$$;

-- ============================================================
-- 5. Review replies
-- ============================================================
CREATE TABLE public.review_replies (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   uuid        NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text        text        NOT NULL CHECK (char_length(text) >= 1),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "replies_select_all" ON public.review_replies FOR SELECT USING (true);
CREATE POLICY "replies_insert_own" ON public.review_replies FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "replies_delete_own" ON public.review_replies FOR DELETE
  USING (user_id = auth.uid());
