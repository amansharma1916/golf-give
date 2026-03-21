ALTER TABLE draws
ADD COLUMN IF NOT EXISTS algorithm_mode TEXT CHECK (algorithm_mode IN ('most_common', 'least_common'));
