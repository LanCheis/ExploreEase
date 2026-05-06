-- Add flag_reason to reviews and update flag/unflag RPCs to store it

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS flag_reason text;

CREATE OR REPLACE FUNCTION public.flag_review(p_review_id uuid, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.reviews
  SET is_flagged = true, flag_reason = p_reason
  WHERE id = p_review_id
    AND user_id != auth.uid()
    AND NOT is_flagged;
$$;

CREATE OR REPLACE FUNCTION public.unflag_review(p_review_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.reviews SET is_flagged = false, flag_reason = null WHERE id = p_review_id;
$$;
