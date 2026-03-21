-- Create winner_disputes table for tracking payout disputes
CREATE TABLE IF NOT EXISTS public.winner_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'rejected')),
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_winner_disputes_payout_id ON public.winner_disputes(payout_id);
CREATE INDEX IF NOT EXISTS idx_winner_disputes_user_id ON public.winner_disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_winner_disputes_status ON public.winner_disputes(status);

-- Enable RLS
ALTER TABLE public.winner_disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own disputes
CREATE POLICY "Users can view their own disputes"
    ON public.winner_disputes FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all disputes
CREATE POLICY "Admins can view all disputes"
    ON public.winner_disputes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Users can create disputes for their own payouts
CREATE POLICY "Users can create their own disputes"
    ON public.winner_disputes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.payouts
            WHERE payouts.id = payout_id
            AND payouts.user_id = auth.uid()
        )
    );

-- Admins can update disputes
CREATE POLICY "Admins can update disputes"
    ON public.winner_disputes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Add comment
COMMENT ON TABLE public.winner_disputes IS 'Tracks disputes filed by winners regarding payouts or verification issues';
