-- Migration: rename loans.merchant_id to loans.vendor_id and re-point FK to vendors.
-- The legacy merchants concept has been replaced by vendors in StepFi.

-- Drop the old foreign key constraint to public.merchants if present.
DO $$
DECLARE
    fk_name TEXT;
BEGIN
    SELECT conname INTO fk_name
    FROM pg_constraint
    WHERE conrelid = 'public.loans'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) LIKE '%REFERENCES public.merchants%';

    IF fk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.loans DROP CONSTRAINT %I', fk_name);
    END IF;
END $$;

-- Drop the old index, if present.
DROP INDEX IF EXISTS public.idx_loans_merchant_id;

-- Rename the column.
ALTER TABLE public.loans RENAME COLUMN merchant_id TO vendor_id;

-- Recreate the index on the renamed column.
CREATE INDEX IF NOT EXISTS idx_loans_vendor_id ON public.loans (vendor_id);

-- Add new FK to vendors(id). Existing rows keep their UUIDs but may not match
-- a vendor row yet — leave NOT VALID so the constraint applies only to new writes.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendors') THEN
        ALTER TABLE public.loans
            ADD CONSTRAINT loans_vendor_id_fkey
            FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) NOT VALID;
    END IF;
END $$;
