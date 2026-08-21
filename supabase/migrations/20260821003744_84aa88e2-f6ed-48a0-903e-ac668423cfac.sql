CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.room_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'Baik',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX room_items_room_id_idx ON public.room_items(room_id);

CREATE TABLE public.shared_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Umum',
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'Baik',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_items TO anon, authenticated;
GRANT ALL ON public.rooms TO service_role;
GRANT ALL ON public.room_items TO service_role;
GRANT ALL ON public.shared_items TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access to rooms" ON public.rooms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to room_items" ON public.room_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to shared_items" ON public.shared_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER room_items_updated_at BEFORE UPDATE ON public.room_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER shared_items_updated_at BEFORE UPDATE ON public.shared_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.rooms (number, floor)
SELECT lpad(n::text, 3, '0'),
       CASE WHEN n <= 10 THEN 1 WHEN n <= 21 THEN 2 ELSE 3 END
FROM generate_series(1, 32) AS n;

INSERT INTO public.room_items (room_id, name, quantity)
SELECT r.id, i.name, i.qty
FROM public.rooms r
CROSS JOIN (VALUES
  ('TV', 1), ('AC', 1), ('Dipan', 1), ('Meja Belajar', 1), ('Kursi Pendek', 1),
  ('Kursi Panjang', 1), ('MCB Listrik', 1), ('Kasur', 1), ('Bantal Guling', 2)
) AS i(name, qty);

INSERT INTO public.shared_items (name, category, quantity, location) VALUES
  ('Pompa Air', 'Air', 1, 'Area belakang'),
  ('Torent Air', 'Air', 1, 'Atap'),
  ('Pagar', 'Bangunan', 1, 'Depan'),
  ('Trafo Listrik Utama', 'Listrik', 1, 'Depan'),
  ('Kompor Gas', 'Dapur', 1, 'Dapur 1'),
  ('Dapur 1', 'Dapur', 1, 'Lantai 1'),
  ('Dapur 2', 'Dapur', 1, 'Lantai 2'),
  ('Dapur 3', 'Dapur', 1, 'Lantai 3'),
  ('Lampu Halaman 1', 'Penerangan', 1, 'Halaman depan'),
  ('Lampu Halaman 2', 'Penerangan', 1, 'Halaman samping'),
  ('Access Point 1', 'Jaringan', 1, 'Lantai 1'),
  ('IP Camera 1', 'Keamanan', 1, 'Depan'),
  ('IP Camera 2', 'Keamanan', 1, 'Lorong lantai 1');