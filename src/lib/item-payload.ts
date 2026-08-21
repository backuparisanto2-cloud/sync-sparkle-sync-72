import type { ItemFormValues } from "@/components/ItemFormDialog";
import type { ItemPayload } from "@/lib/inventory";

export function itemPayload(values: ItemFormValues): ItemPayload {
  const price = values.purchase_price.trim();
  return {
    name: values.name,
    quantity: values.quantity,
    condition: values.condition,
    notes: values.notes || null,
    vendor: values.vendor.trim() || null,
    purchase_price: price === "" ? null : Number(price),
    purchase_date: values.purchase_date || null,
    warranty_until: values.warranty_until || null,
    photos: values.photos,
    receipts: values.receipts,
  };
}

export function formInitial(item: {
  name: string;
  quantity: number;
  condition: string;
  notes: string | null;
  vendor: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  warranty_until: string | null;
  photos: string[];
  receipts: string[];
  category?: string;
  location?: string | null;
}): Partial<ItemFormValues> {
  return {
    name: item.name,
    quantity: item.quantity,
    condition: item.condition,
    notes: item.notes ?? "",
    vendor: item.vendor ?? "",
    purchase_price: item.purchase_price === null ? "" : String(item.purchase_price),
    purchase_date: item.purchase_date ?? "",
    warranty_until: item.warranty_until ?? "",
    photos: item.photos,
    receipts: item.receipts,
    ...(item.category ? { category: item.category } : {}),
    location: item.location ?? "",
  };
}
