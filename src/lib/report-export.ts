import type { ColumnConfig, EnrichedRow } from "@/lib/report-columns";
import { COLUMN_MAP, formatCell } from "@/lib/report-columns";

export type ExportMeta = {
  title: string;
  periode: string;
  lingkup: string;
  masaManfaat: number;
  ringkasan: { label: string; value: string }[];
};

function activeColumns(columns: ColumnConfig[]) {
  return columns
    .filter((c) => c.visible)
    .map((c) => ({ config: c, def: COLUMN_MAP.get(c.key)! }))
    .filter((c) => Boolean(c.def));
}

export async function exportExcel(
  rows: EnrichedRow[],
  columns: ColumnConfig[],
  meta: ExportMeta,
  filename: string,
) {
  const XLSX = await import("xlsx");
  const cols = activeColumns(columns);

  const head: (string | number | null)[][] = [
    [meta.title],
    [`Periode: ${meta.periode}`],
    [`Lingkup: ${meta.lingkup} · Masa manfaat: ${meta.masaManfaat} tahun`],
    [],
    ...meta.ringkasan.map((r) => [r.label, r.value]),
    [],
  ];

  const header = cols.map((c) => c.config.label);
  const body = rows.map((row) =>
    cols.map((c) => {
      const value = c.def.value(row);
      if (value === null) return "";
      if (c.def.type === "currency" || c.def.type === "number") return Number(value);
      return String(value);
    }),
  );

  const sheet = XLSX.utils.aoa_to_sheet([...head, header, ...body]);
  const headerRow = head.length;
  sheet["!cols"] = cols.map((c) => ({
    wch: Math.max(12, Math.min(34, c.config.label.length + 6)),
  }));

  cols.forEach((c, i) => {
    if (c.def.type !== "currency") return;
    for (let r = 0; r < body.length; r += 1) {
      const ref = XLSX.utils.encode_cell({ r: headerRow + 1 + r, c: i });
      const cell = sheet[ref];
      if (cell && typeof cell.v === "number") cell.z = '"Rp"#,##0;("Rp"#,##0);"-"';
    }
  });

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Laporan");
  XLSX.writeFile(book, filename);
}

export async function exportPdf(
  rows: EnrichedRow[],
  columns: ColumnConfig[],
  meta: ExportMeta,
  filename: string,
) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;
  const cols = activeColumns(columns);

  const doc = new jsPDF({ orientation: cols.length > 6 ? "landscape" : "portrait", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(meta.title, 40, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Periode: ${meta.periode}`, 40, 60);
  doc.text(`Lingkup: ${meta.lingkup} · Masa manfaat: ${meta.masaManfaat} tahun`, 40, 73);
  doc.text(meta.ringkasan.map((r) => `${r.label}: ${r.value}`).join("   |   "), 40, 86, {
    maxWidth: pageWidth - 80,
  });
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 104,
    head: [cols.map((c) => c.config.label)],
    body: rows.map((row) => cols.map((c) => formatCell(c.def.value(row), c.def.type))),
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 24, 20], textColor: [214, 183, 106], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 246, 241] },
    columnStyles: Object.fromEntries(
      cols.map((c, i) => [
        i,
        { halign: c.def.type === "currency" || c.def.type === "number" ? "right" : "left" },
      ]),
    ),
    margin: { left: 40, right: 40, bottom: 40 },
    didDrawPage: () => {
      const page = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(130);
      doc.text(
        `Halaman ${page}`,
        pageWidth - 40,
        doc.internal.pageSize.getHeight() - 20,
        { align: "right" },
      );
      doc.setTextColor(0);
    },
  });

  doc.save(filename);
}
