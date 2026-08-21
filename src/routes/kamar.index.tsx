import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { allRoomItemsQuery, roomsQuery } from "@/lib/inventory";

type Search = { lantai: number };

export const Route = createFileRoute("/kamar/")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const raw = Number(search["lantai"]);
    return { lantai: raw === 2 || raw === 3 ? raw : 1 };
  },
  head: () => ({
    meta: [
      { title: "Daftar Kamar — Inventaris Lavin Kost" },
      {
        name: "description",
        content:
          "Daftar 32 kamar Lavin Kost Purwokerto per lantai beserta jumlah inventaris tiap kamar.",
      },
      { property: "og:title", content: "Daftar Kamar — Inventaris Lavin Kost" },
      {
        property: "og:description",
        content: "Pilih kamar untuk mencatat, menambah, atau mengurangi fasilitas kamar.",
      },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const { lantai } = Route.useSearch();
  const rooms = useQuery(roomsQuery);
  const items = useQuery(allRoomItemsQuery);

  const perRoom = new Map<string, { total: number; masalah: number }>();
  for (const item of items.data ?? []) {
    const entry = perRoom.get(item.room_id) ?? { total: 0, masalah: 0 };
    entry.total += item.quantity;
    if (item.condition !== "Baik") entry.masalah += 1;
    perRoom.set(item.room_id, entry);
  }

  const list = (rooms.data ?? []).filter((r) => r.floor === lantai);

  return (
    <AppShell title="Kamar" subtitle="Pilih kamar untuk melihat dan mengubah inventarisnya.">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3].map((floor) => (
          <Link
            key={floor}
            to="/kamar"
            search={{ lantai: floor }}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
              floor === lantai
                ? "border-gold bg-gold text-primary-foreground"
                : "border-gold-line text-muted-foreground hover:bg-accent"
            }`}
          >
            Lantai {floor}
          </Link>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rooms.isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-gold-line" />
            ))
          : list.map((room) => {
              const stat = perRoom.get(room.id) ?? { total: 0, masalah: 0 };
              return (
                <Link
                  key={room.id}
                  to="/kamar/$nomor"
                  params={{ nomor: room.number }}
                  className="gold-card rounded-xl p-4 transition-colors hover:bg-accent"
                >
                  <p className="font-display text-2xl font-semibold tracking-tight">
                    {room.number}
                  </p>
                  <div className="mt-2 h-px w-8 bg-gold" />
                  <p className="mt-2 text-xs text-muted-foreground">{stat.total} unit barang</p>
                  {stat.masalah > 0 ? (
                    <p className="mt-1 text-xs text-destructive">{stat.masalah} perlu perhatian</p>
                  ) : null}
                </Link>
              );
            })}
      </div>
    </AppShell>
  );
}
