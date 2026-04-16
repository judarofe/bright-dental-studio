
CREATE POLICY "Users can insert own specialties"
  ON public.user_specialties FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own specialties"
  ON public.user_specialties FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
