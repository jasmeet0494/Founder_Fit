-- ============================================================
-- FounderFit – Database Setup
-- Tables, Trigger, RLS Policies, Grants, Seed Data
-- Safe to re-run (uses IF NOT EXISTS / IF EXISTS guards)
-- ============================================================

-- ---------- PROFILES TABLE ----------
CREATE TABLE IF NOT EXISTS public.profiles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id    uuid UNIQUE REFERENCES auth.users(id),
    full_name       text NOT NULL,
    email           text,
    intent          text CHECK (intent IN ('founder', 'cofounder')),

    -- Founder fields
    startup_name            text,
    one_liner_pitch         text,
    industry                text,
    current_stage           text CHECK (current_stage IN ('Idea', 'Prototype', 'Revenue')),
    cofounder_skill_needed  text,

    -- Cofounder fields
    skill_domain        text,
    years_experience    int,
    short_bio           text,
    preferred_industry  text,
    open_to_remote      text CHECK (open_to_remote IN ('Yes', 'No', 'Flexible')),

    -- Meta
    is_demo     boolean DEFAULT false,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

-- ---------- CONNECTION_REQUESTS TABLE ----------
CREATE TABLE IF NOT EXISTS public.connection_requests (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id    uuid NOT NULL REFERENCES auth.users(id),
    to_profile_id   uuid NOT NULL REFERENCES public.profiles(id),
    status          text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at      timestamptz DEFAULT now()
);

-- ---------- TRIGGER: auto-create profile on auth signup ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (auth_user_id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ---------- ROW LEVEL SECURITY ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = auth_user_id);

-- Connection_requests policies
DROP POLICY IF EXISTS "Users can see their own connection requests" ON public.connection_requests;
CREATE POLICY "Users can see their own connection requests"
    ON public.connection_requests FOR SELECT
    TO authenticated
    USING (
        from_user_id = auth.uid()
        OR to_profile_id IN (
            SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert connection requests" ON public.connection_requests;
CREATE POLICY "Users can insert connection requests"
    ON public.connection_requests FOR INSERT
    TO authenticated
    WITH CHECK (from_user_id = auth.uid());

-- ---------- GRANTS ----------
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.connection_requests TO authenticated;

-- ---------- SEED DATA (demo rows, safe re-run) ----------

-- Demo cofounders
INSERT INTO public.profiles (full_name, intent, skill_domain, years_experience, short_bio, preferred_industry, open_to_remote, is_demo)
SELECT 'James Kim', 'cofounder', 'Technical', 5,
       'Full stack Dev, 5 yrs exp. Loves fintech & Health tech.',
       'Fintech', 'Yes', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'James Kim' AND is_demo = true);

INSERT INTO public.profiles (full_name, intent, skill_domain, years_experience, short_bio, preferred_industry, open_to_remote, is_demo)
SELECT 'Sara Ramos', 'cofounder', 'Commercial', 5,
       'GTM strategist. Marketing expert with 5 yrs experience.',
       'SaaS', 'Flexible', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Sara Ramos' AND is_demo = true);

INSERT INTO public.profiles (full_name, intent, skill_domain, years_experience, short_bio, preferred_industry, open_to_remote, is_demo)
SELECT 'Mia Lee', 'cofounder', 'Operational', 10,
       'Supply Chain Expert with 10+ yrs of experience.',
       'E-commerce', 'Yes', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Mia Lee' AND is_demo = true);

INSERT INTO public.profiles (full_name, intent, skill_domain, years_experience, short_bio, preferred_industry, open_to_remote, is_demo)
SELECT 'Alex Chen', 'cofounder', 'Technical', 7,
       'AI/ML engineer with deep experience in scaling startups.',
       'AI/ML', 'Yes', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Alex Chen' AND is_demo = true);

INSERT INTO public.profiles (full_name, intent, skill_domain, years_experience, short_bio, preferred_industry, open_to_remote, is_demo)
SELECT 'Priya Sharma', 'cofounder', 'Design', 6,
       'Product designer focused on consumer mobile apps.',
       'Consumer', 'Flexible', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Priya Sharma' AND is_demo = true);

-- Demo founders
INSERT INTO public.profiles (full_name, intent, startup_name, one_liner_pitch, industry, current_stage, cofounder_skill_needed, is_demo)
SELECT 'Daniel Wong', 'founder', 'EduSpark',
       'AI-powered tutoring for high school STEM students.',
       'EdTech', 'Prototype', 'Technical', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Daniel Wong' AND is_demo = true);

INSERT INTO public.profiles (full_name, intent, startup_name, one_liner_pitch, industry, current_stage, cofounder_skill_needed, is_demo)
SELECT 'Lena Patel', 'founder', 'GreenRoute',
       'Carbon-aware logistics planning for SMB e-commerce.',
       'ClimateTech', 'Idea', 'Commercial', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Lena Patel' AND is_demo = true);

INSERT INTO public.profiles (full_name, intent, startup_name, one_liner_pitch, industry, current_stage, cofounder_skill_needed, is_demo)
SELECT 'Marcus Black', 'founder', 'HealthHub',
       'Telehealth marketplace for allied health professionals.',
       'HealthTech', 'Revenue', 'Operational', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Marcus Black' AND is_demo = true);