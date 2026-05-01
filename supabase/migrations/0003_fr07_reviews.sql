-- FR-07 Rating & Review — schema only. UI comes in a later chat.
-- Trigger keeps places.rating in sync after every review change.

-- Defensive: rating column may have been added via dashboard already.
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS rating double precision;

-- ============================================================
-- reviews
-- ============================================================
CREATE TABLE public.reviews (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id      uuid         NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id       uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating        int          NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          text,
  photo_url     text,
  helpful_count int          NOT NULL DEFAULT 0,
  is_flagged    bool         NOT NULL DEFAULT false,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX reviews_place_idx ON public.reviews (place_id);
CREATE INDEX reviews_user_idx  ON public.reviews (user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (is_flagged = false);

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- TODO FR-11: admin can set is_flagged.
-- CREATE POLICY "reviews_flag_admin"
--   ON public.reviews FOR UPDATE
--   TO authenticated
--   USING ((auth.jwt() ->> 'role') = 'admin');

-- ============================================================
-- review_helpful
-- ============================================================
CREATE TABLE public.review_helpful (
  review_id  uuid        NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_helpful_select"
  ON public.review_helpful FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "review_helpful_insert_own"
  ON public.review_helpful FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_helpful_delete_own"
  ON public.review_helpful FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: keep places.rating = avg of non-flagged reviews
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_place_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
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

CREATE TRIGGER reviews_update_place_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_place_rating();
