-- Add tax-related columns to payouts table
ALTER TABLE public.payouts 
ADD COLUMN IF NOT EXISTS gross_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 30;

-- Backfill existing records: set gross_amount = amount, calculate net and tax
UPDATE public.payouts
SET 
  gross_amount = amount,
  tax_amount = ROUND(amount * (tax_rate / 100), 2),
  net_amount = ROUND(amount * (1 - tax_rate / 100), 2)
WHERE gross_amount = 0 AND amount > 0;

-- Add comment
COMMENT ON COLUMN public.payouts.gross_amount IS 'Prize amount before tax withholding';
COMMENT ON COLUMN public.payouts.net_amount IS 'Prize amount after tax withholding';
COMMENT ON COLUMN public.payouts.tax_amount IS 'Amount withheld for tax';
COMMENT ON COLUMN public.payouts.tax_rate IS 'Tax rate applied as percentage';
