import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ReportColumnManager } from "@/components/ReportColumnManager";
import { ConditionBadge } from "@/components/ConditionBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  allRoomItemsQuery,
  conditionsQuery,
  formatRupiah,
  roomsQuery,
  sharedItemsQuery,
} from "@/lib/inventory";
import { applyFilters, buildRows, byCondition, groupBy, presetRange, type Scope } from "@/lib/report";
import {
  COLUMN_MAP,
  defaultColumnConfig,
  enrichRows,
  formatCell,
  sortRows,
  type ColumnConfig,
  type ColumnKey,
  type SortState,
} from "@/lib/report-columns";
import { exportExcel, exportPdf } from "@/lib/report-export";

export const Route = createFileRoute("/laporan")({
  component: LaporanPage,
  head: () => ({
    meta: [
      { title: "Laporan Inventaris — Lavin Kost Purwokerto" },
      {
        name: "description",
        content:
          "Laporan kondisi barang, pembelian, dan depresiasi inventaris Lavin Kost dengan filter periode serta ekspor PDF dan Excel.",
      },
      { property: "og:title", content: "Laporan Inventaris — Lavin Kost Purwokerto" },
      {
        property: "og:description",
        content: "Rekap pembelian, kondisi, dan depresiasi aset kost yang bisa diekspor ke PDF & Excel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Mode = "rentang" | "bulan";

function monthRange(month: string) {
  if (!month) return { dari: "", sampai: "" };
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return { dari: "", sampai: "" };
  const last = new Date(y, m, 0).getDate();
  return { dari: `${month}-01`, sampai: `${month}-${String(last).padStart(2, "0")}` };
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gold-line bg-card/60 p-4">
      <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function LaporanPage() {
  const rooms = useQuery(roomsQuery);
  const roomItems = useQuery(allRoomItemsQuery);
  const sharedItems = useQuery(sharedItemsQuery);
  const conditions = useQuery(conditionsQuery);

  const [mode, setMode] = useState<Mode>("rentang");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [bulan, setBulan] = useState(() => new Date().toISOString().slice(0, 7));
  const [lingkup, setLingkup] = useState<Scope>("semua");
  const [lantai, setLantai] = useState(0);
  const [masaManfaat, setMasaManfaat] = useState(4);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumnConfig);
  const [sort, setSort] = useState<SortState>(null);
  const [sertakanTanpaTanggal, setSertakanTanpaTanggal] = useState(false);
  const [basisGrup, setBasisGrup] = useState<"grup" | "nama">("grup");

  const range = mode === "bulan" ? monthRange(bulan) : { dari, sampai };

  const base = useMemo(
    () => buildRows(rooms.data ?? [], roomItems.data ?? [], sharedItems.data ?? []),
    [rooms.data, roomItems.data, sharedItems.data],
  );

  const filtered = useMemo(
    () => applyFilters(base, { dari: range.dari, sampai: range.sampai, lingkup, lantai }),
    [base, range.dari, range.sampai, lingkup, lantai],
  );

  const scopedRows = useMemo(
    () => (sertakanTanpaTanggal ? [...filtered.rows, ...filtered.tanpaTanggal] : filtered.rows),
    [filtered.rows, filtered.tanpaTanggal, sertakanTanpaTanggal],
  );

  const asOf = range.sampai ? new Date(`${range.sampai}T23:59:59`) : new Date();
  const enriched = useMemo(
    () => enrichRows(scopedRows, masaManfaat, asOf),
    [scopedRows, masaManfaat, range.sampai],
  );
  const rows = useMemo(() => sortRows(enriched, sort), [enriched, sort]);

  const summary = useMemo(() => {
    let unit = 0;
    let pembelian = 0;
    let depresiasi = 0;
    let nilaiBuku = 0;
    let perluPerhatian = 0;
    for (const row of rows) {
      unit += row.quantity;
      pembelian += row.nilai_total ?? 0;
      depresiasi += row.depresiasi ?? 0;
      nilaiBuku += row.nilai_buku ?? 0;
      if (row.condition !== "Baik") perluPerhatian += 1;
    }
    return { unit, pembelian, depresiasi, nilaiBuku, perluPerhatian };
  }, [rows]);

  const perKondisi = useMemo(
    () => byCondition(filtered.rows, conditions.data ?? []),
    [filtered.rows, conditions.data],
  );
  const perGrup = useMemo(
    () =>
      groupBy(filtered.rows, (r) => r.group)
        .sort((a, b) => b.nilai - a.nilai)
        .slice(0, 8),
    [filtered.rows],
  );

  const visibleColumns = columns.filter((c) => c.visible);
  const periodeLabel =
    range.dari || range.sampai
      ? `${range.dari || "awal"} s/d ${range.sampai || "sekarang"}`
      : "Semua periode";
  const lingkupLabel =
    lingkup === "semua" ? "Semua" : lingkup === "kamar" ? "Kamar" : "Fasilitas Utama";

  const meta = {
    title: "Laporan Inventaris Lavin Kost Purwokerto",
    periode: periodeLabel,
    lingkup: lingkupLabel + (lantai > 0 ? ` · Lantai ${lantai}` : ""),
    masaManfaat,
    ringkasan: [
      { label: "Jenis barang", value: String(rows.length) },
      { label: "Total unit", value: String(summary.unit) },
      { label: "Nilai pembelian", value: formatRupiah(summary.pembelian) ?? "-" },
      { label: "Akumulasi depresiasi", value: formatRupiah(summary.depresiasi) ?? "-" },
      { label: "Nilai buku", value: formatRupiah(summary.nilaiBuku) ?? "-" },
    ],
  };

  const stamp = new Date().toISOString().slice(0, 10);

  async function handleExport(kind: "pdf" | "excel") {
    if (!visibleColumns.length) {
      toast.error("Pilih minimal satu kolom sebelum ekspor.");
      return;
    }
    try {
      if (kind === "pdf") {
        await exportPdf(rows, columns, meta, `laporan-inventaris-${stamp}.pdf`);
      } else {
        await exportExcel(rows, columns, meta, `laporan-inventaris-${stamp}.xlsx`);
      }
      toast.success(`Laporan ${kind === "pdf" ? "PDF" : "Excel"} berhasil diunduh.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengekspor laporan.");
    }
  }

  function toggleSort(key: ColumnKey) {
    setSort((prev) =>
      prev?.key === key ? (prev.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" },
    );
  }

  const floors = [...new Set((rooms.data ?? []).map((r) => r.floor))].sort();

  return (
    <AppShell
      title="Laporan"
      subtitle="Kondisi barang, pembelian, dan depresiasi aset — siap diekspor ke PDF atau Excel."
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-gold-line bg-card/60 p-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="rentang">Rentang tanggal</TabsTrigger>
              <TabsTrigger value="bulan">Bulan &amp; tahun</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mode === "rentang" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="dari">Dari</Label>
                  <Input id="dari" type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sampai">Sampai</Label>
                  <Input
                    id="sampai"
                    type="date"
                    value={sampai}
                    onChange={(e) => setSampai(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bulan">Bulan</Label>
                <Input
                  id="bulan"
                  type="month"
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Lingkup</Label>
              <Select value={lingkup} onValueChange={(v) => setLingkup(v as Scope)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua</SelectItem>
                  <SelectItem value="kamar">Kamar</SelectItem>
                  <SelectItem value="fasilitas">Fasilitas Utama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Lantai</Label>
              <Select value={String(lantai)} onValueChange={(v) => setLantai(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Semua lantai</SelectItem>
                  {floors.map((f) => (
                    <SelectItem key={f} value={String(f)}>
                      Lantai {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-2">
            {(["bulan", "tiga-bulan", "tahun", "semua"] as const).map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => {
                  const r = presetRange(preset);
                  setMode("rentang");
                  setDari(r.dari);
                  setSampai(r.sampai);
                }}
              >
                {preset === "bulan"
                  ? "Bulan ini"
                  : preset === "tiga-bulan"
                    ? "3 bulan"
                    : preset === "tahun"
                      ? "Tahun ini"
                      : "Semua"}
              </Button>
            ))}
            <div className="ml-auto w-40 space-y-1.5">
              <Label htmlFor="masa">Masa manfaat (tahun)</Label>
              <Input
                id="masa"
                type="number"
                min={1}
                max={20}
                value={masaManfaat}
                onChange={(e) => setMasaManfaat(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>

          {filtered.tanpaTanggal.length > 0 ? (
            <p className="mt-3 text-[11px] text-muted-foreground">
              {filtered.tanpaTanggal.length} barang tanpa tanggal pembelian tidak masuk periode ini.
            </p>
          ) : null}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card label="Jenis barang" value={String(rows.length)} hint={`${summary.unit} unit`} />
          <Card label="Nilai pembelian" value={formatRupiah(summary.pembelian) ?? "-"} />
          <Card
            label="Akumulasi depresiasi"
            value={formatRupiah(summary.depresiasi) ?? "-"}
            hint={`Garis lurus ${masaManfaat} tahun`}
          />
          <Card label="Nilai buku" value={formatRupiah(summary.nilaiBuku) ?? "-"} />
          <Card label="Perlu perhatian" value={String(summary.perluPerhatian)} hint="Kondisi bukan Baik" />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gold-line bg-card/60 p-4">
            <h2 className="font-display text-lg font-semibold">Kondisi barang</h2>
            <ul className="mt-3 space-y-2">
              {perKondisi.map((b) => (
                <li key={b.key} className="flex items-center justify-between gap-3 text-sm">
                  <ConditionBadge condition={b.key} />
                  <span className="text-muted-foreground">
                    {b.jenis} jenis · {b.unit} unit · {formatRupiah(b.nilai) ?? "-"}
                  </span>
                </li>
              ))}
              {perKondisi.length === 0 ? (
                <li className="text-sm text-muted-foreground">Tidak ada data.</li>
              ) : null}
            </ul>
          </div>
          <div className="rounded-xl border border-gold-line bg-card/60 p-4">
            <h2 className="font-display text-lg font-semibold">Pembelian terbesar per grup</h2>
            <ul className="mt-3 space-y-2">
              {perGrup.map((b) => (
                <li key={b.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{b.key}</span>
                  <span className="shrink-0 text-muted-foreground">{formatRupiah(b.nilai) ?? "-"}</span>
                </li>
              ))}
              {perGrup.length === 0 ? (
                <li className="text-sm text-muted-foreground">Tidak ada data.</li>
              ) : null}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-gold-line bg-card/60 p-4">
          <h2 className="font-display text-lg font-semibold">Susunan kolom ekspor</h2>
          <div className="mt-3">
            <ReportColumnManager columns={columns} onChange={setColumns} />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">
              Pratinjau ekspor{" "}
              <span className="text-sm font-normal text-muted-foreground">({rows.length} baris)</span>
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
              </Button>
              <Button onClick={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gold-line">
            <table className="w-full min-w-max text-sm">
              <thead className="bg-accent/40">
                <tr>
                  {visibleColumns.map((col) => (
                    <th key={col.key} className="whitespace-nowrap px-3 py-2 text-left font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-gold"
                      >
                        {col.label}
                        <ArrowDownUp className="h-3 w-3 opacity-50" />
                        {sort?.key === col.key ? (
                          <span className="text-[10px]">{sort.dir === "asc" ? "▲" : "▼"}</span>
                        ) : null}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-gold-line/60">
                    {visibleColumns.map((col) => {
                      const def = COLUMN_MAP.get(col.key)!;
                      const isNum = def.type === "currency" || def.type === "number";
                      return (
                        <td
                          key={col.key}
                          className={`whitespace-nowrap px-3 py-2 ${isNum ? "text-right tabular-nums" : ""}`}
                        >
                          {formatCell(def.value(row), def.type)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Math.max(1, visibleColumns.length)}
                      className="px-3 py-8 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data untuk filter ini.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
