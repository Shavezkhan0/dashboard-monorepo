-- Create data_sources table

CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('csv', 'api', 'database', 'manual')),
    connection_string TEXT,
    data JSONB,
    config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON public.data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON public.data_sources(type);

-- Enable Row Level Security
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data sources
CREATE POLICY "Users can read own data sources"
    ON public.data_sources
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own data sources
CREATE POLICY "Users can create own data sources"
    ON public.data_sources
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data sources
CREATE POLICY "Users can update own data sources"
    ON public.data_sources
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own data sources
CREATE POLICY "Users can delete own data sources"
    ON public.data_sources
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for API)
CREATE POLICY "Service role full access"
    ON public.data_sources
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON public.data_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
