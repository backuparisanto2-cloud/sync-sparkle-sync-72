ALTER TABLE public.room_items
  ADD COLUMN IF NOT EXISTS vendor text,
  ADD COLUMN IF NOT EXISTS purchase_price numeric,
  ADD COLUMN IF NOT EXISTS purchase_date date,
  ADD COLUMN IF NOT EXISTS warranty_until date,
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS receipts jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.shared_items
  ADD COLUMN IF NOT EXISTS vendor text,
  ADD COLUMN IF NOT EXISTS purchase_price numeric,
  ADD COLUMN IF NOT EXISTS purchase_date date,
  ADD COLUMN IF NOT EXISTS warranty_until date,
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS receipts jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.conditions (
  name text PRIMARY KEY,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conditions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conditions TO anon;
GRANT ALL ON public.conditions TO service_role;

ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access to conditions" ON public.conditions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.conditions (name, sort_order) VALUES
  ('Baik', 1), ('Perlu Perbaikan', 2), ('Rusak', 3)
ON CONFLICT (name) DO NOTHING;