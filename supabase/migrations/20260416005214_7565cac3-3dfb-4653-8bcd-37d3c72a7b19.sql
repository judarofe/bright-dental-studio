
-- 1. Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Specialties catalog
CREATE TABLE public.specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Stethoscope',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Specialties viewable by authenticated"
  ON public.specialties FOR SELECT TO authenticated
  USING (true);

-- 3. Seed odontología
INSERT INTO public.specialties (code, name, description, icon, sort_order)
VALUES ('odontologia', 'Odontología', 'Módulo de historia clínica odontológica completa', 'HeartPulse', 1);

-- 4. User-specialty assignments
CREATE TABLE public.user_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, specialty_id)
);

ALTER TABLE public.user_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own specialties"
  ON public.user_specialties FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user specialties"
  ON public.user_specialties FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user specialties"
  ON public.user_specialties FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user specialties"
  ON public.user_specialties FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
