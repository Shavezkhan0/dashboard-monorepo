-- Create dashboards table

CREATE TABLE IF NOT EXISTS public.dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_public ON public.dashboards(is_public) WHERE is_public = true;

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own dashboards
CREATE POLICY "Users can read own dashboards"
    ON public.dashboards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can read public dashboards
CREATE POLICY "Anyone can read public dashboards"
    ON public.dashboards
    FOR SELECT
    USING (is_public = true);

-- Policy: Users can create their own dashboards
CREATE POLICY "Users can create own dashboards"
    ON public.dashboards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own dashboards
CREATE POLICY "Users can update own dashboards"
    ON public.dashboards
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own dashboards
CREATE POLICY "Users can delete own dashboards"
    ON public.dashboards
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for API)
CREATE POLICY "Service role full access"
    ON public.dashboards
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_dashboards_updated_at
    BEFORE UPDATE ON public.dashboards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
