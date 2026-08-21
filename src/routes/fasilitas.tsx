import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { InventoryItemCard } from "@/components/InventoryItemCard";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  addSharedItem,
  deleteSharedItem,
  sharedItemsQuery,
  updateSharedItem,
} from "@/lib/inventory";
import { formInitial, itemPayload } from "@/lib/item-payload";

export const Route = createFileRoute("/fasilitas")({
  head: () => ({
    meta: [
      { title: "Fasilitas Utama Kost — Inventaris Lavin Kost" },
      {
        name: "description",
        content:
          "Catatan fasilitas bersama Lavin Kost Purwokerto: pompa air, torent, pagar, trafo listrik, dapur, lampu halaman, access point, dan IP camera, lengkap dengan vendor, harga, garansi, dan nota.",
      },
      { property: "og:title", content: "Fasilitas Utama Kost — Inventaris Lavin Kost" },
      {
        property: "og:description",
        content: "Tambah, edit, dan kurangi fasilitas bersama Lavin Kost Purwokerto.",
      },
    ],
  }),
  component: SharedFacilities,
});

function SharedFacilities() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string>("Semua");
  const queryClient = useQueryClient();
  const shared = useQuery(sharedItemsQuery);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["shared_items"] });
  const mutate = useMutation({
    mutationFn: async (fn: () => Promise<void>) => fn(),
    onSuccess: () => refresh(),
    onError: (error: Error) => toast.error(error.message),
  });

  const all = shared.data ?? [];
  const categories = ["Semua", ...Array.from(new Set(all.map((i) => i.category))).sort()];
  const list = all.filter(
    (i) =>
      (category === "Semua" || i.category === category) &&
      i.name.toLowerCase().includes(keyword.trim().toLowerCase()),
  );

  return (
    <AppShell
      title="Fasilitas Utama Kost"
      subtitle="Fasilitas yang dipakai bersama seluruh penghuni kost."
    >
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <div className="grid gap-2 sm:flex sm:items-center sm:justify-between">
          <div className="relative min-w-0 sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari fasilitas..."
              className="h-11 pl-9"
              aria-label="Cari fasilitas"
            />
          </div>
          <ItemFormDialog
            trigger={
              <Button className="h-11 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Tambah fasilitas
              </Button>
            }
            title="Tambah fasilitas utama"
            withCategory
            folder="fasilitas"
            onSubmit={async (values) => {
              await addSharedItem({
                ...itemPayload(values),
                category: values.category ?? "Umum",
                location: values.location || null,
              });
              await refresh();
              toast.success("Fasilitas ditambahkan");
            }}
          />
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                c === category
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-gold-line text-muted-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {shared.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Memuat...</p>
      ) : list.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Tidak ada fasilitas yang cocok.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {list.map((item) => (
            <InventoryItemCard
              key={item.id}
              name={item.name}
              condition={item.condition}
              quantity={item.quantity}
              notes={item.notes}
              meta={`${item.category}${item.location ? ` · ${item.location}` : ""}`}
              vendor={item.vendor}
              purchasePrice={item.purchase_price}
              warrantyUntil={item.warranty_until}
              photos={item.photos}
              receipts={item.receipts}
              onQuantityChange={(next) =>
                mutate.mutate(() => updateSharedItem(item.id, { quantity: next }))
              }
              actions={
                <>
                  <ItemFormDialog
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${item.name}`}
                        className="h-11 w-11"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                    title="Edit fasilitas"
                    withCategory
                    folder="fasilitas"
                    initial={formInitial(item)}
                    onSubmit={async (values) => {
                      await updateSharedItem(item.id, {
                        ...itemPayload(values),
                        category: values.category ?? "Umum",
                        location: values.location || null,
                      });
                      await refresh();
                      toast.success("Perubahan disimpan");
                    }}
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Hapus ${item.name}`}
                        className="h-11 w-11 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-gold-line">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-2xl">
                          Hapus {item.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Fasilitas ini akan dihapus permanen dari daftar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            mutate.mutate(async () => {
                              await deleteSharedItem(item.id);
                              toast.success("Fasilitas dihapus");
                            })
                          }
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              }
            />
          ))}
        </ul>
      )}
    </AppShell>
  );
}
