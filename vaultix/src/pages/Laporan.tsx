import { useState, useRef } from "react";
import { FileText, Download, Printer } from "lucide-react";
import { useGetReportSuratMasuk, useGetReportSuratKeluar, useGetMonthlyStats, useListCategories } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

type ReportItem = Record<string, unknown>;

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Laporan() {
  const [activeTab, setActiveTab] = useState<"masuk" | "keluar">("masuk");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const printRef = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = useListCategories();
  const { data: monthly = [] } = useGetMonthlyStats({ year });

  const params = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    categoryId: filterCat ? parseInt(filterCat) : undefined,
  };

  const { data: reportSM, isLoading: loadSM } = useGetReportSuratMasuk(params, { query: { enabled: activeTab === "masuk" } });
  const { data: reportSK, isLoading: loadSK } = useGetReportSuratKeluar(params, { query: { enabled: activeTab === "keluar" } });

  const currentReport = activeTab === "masuk" ? reportSM : reportSK;
  const isLoading = activeTab === "masuk" ? loadSM : loadSK;

  function handlePrint() { window.print(); }

  function handleExcel() {
    if (activeTab === "masuk") {
      const headers = ["No", "Nomor Surat", "Pengirim", "Perihal", "Tgl Surat", "Tgl Terima", "Status", "Kategori"];
      const rows = ((currentReport?.items ?? []) as ReportItem[]).map((item, i) => [
        String(i + 1), String(item.nomorSurat ?? ""), String(item.pengirim ?? ""), String(item.perihal ?? ""),
        String(item.tanggalSurat ?? ""), String(item.tanggalTerima ?? ""), String(item.status ?? ""), String(item.categoryName ?? "-")
      ]);
      exportCSV(`laporan-surat-masuk-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
    } else {
      const headers = ["No", "Nomor Surat", "Tujuan", "Perihal", "Tgl Surat", "Status", "Kategori"];
      const rows = ((currentReport?.items ?? []) as ReportItem[]).map((item, i) => [
        String(i + 1), String(item.nomorSurat ?? ""), String(item.tujuan ?? ""), String(item.perihal ?? ""),
        String(item.tanggalSurat ?? ""), String(item.status ?? ""), String(item.categoryName ?? "-")
      ]);
      exportCSV(`laporan-surat-keluar-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan</h1>
          <p className="page-subtitle">Cetak dan unduh laporan surat masuk & keluar</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary fw-semibold" onClick={handlePrint} data-testid="button-cetak">
            <Printer size={15} className="me-1" /> Cetak PDF
          </button>
          <button className="btn btn-success fw-semibold" onClick={handleExcel} data-testid="button-unduh-excel">
            <Download size={15} className="me-1" /> Unduh Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link fw-semibold${activeTab === "masuk" ? " active" : ""}`} onClick={() => setActiveTab("masuk")}>
            Surat Masuk
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold${activeTab === "keluar" ? " active" : ""}`} onClick={() => setActiveTab("keluar")}>
            Surat Keluar
          </button>
        </li>
      </ul>

      {/* Filters */}
      <div className="vaultix-card p-3 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-3 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Tanggal Mulai</label>
            <input type="date" className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-3 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Tanggal Akhir</label>
            <input type="date" className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-3 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Kategori</label>
            <select className="form-select form-select-sm" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Semua Kategori</option>
              {(categories as { id: number; name: string }[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-2 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Tahun Rekap</label>
            <input type="number" className="form-control form-control-sm" value={year} min={2020} max={2099} onChange={e => setYear(parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="vaultix-card mb-4" ref={printRef}>
        <div className="p-3 border-bottom">
          <div className="text-center mb-1">
            <h5 className="fw-bold mb-0" style={{ color: "hsl(222 47% 11%)" }}>
              LAPORAN {activeTab === "masuk" ? "SURAT MASUK" : "SURAT KELUAR"}
            </h5>
            <p className="text-muted" style={{ fontSize: "0.8rem", margin: 0 }}>
              Universitas Negeri Jakarta &bull; Vaultix Arsip Digital
              {startDate && endDate && ` &bull; ${startDate} s/d ${endDate}`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4"><div className="spinner-border" style={{ color: "hsl(217 91% 60%)" }} /></div>
        ) : (
          <div className="table-responsive">
            {activeTab === "masuk" ? (
              <table className="table table-striped table-hover vaultix-table mb-0">
                <thead>
                  <tr><th>No</th><th>Nomor Surat</th><th>Pengirim</th><th>Perihal</th><th>Tgl Surat</th><th>Tgl Terima</th><th>Status</th><th>Kategori</th></tr>
                </thead>
                <tbody>
                  {((currentReport?.items ?? []) as ReportItem[]).length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-3 text-muted">Tidak ada data dalam periode ini</td></tr>
                  ) : (
                    ((currentReport?.items ?? []) as ReportItem[]).map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold" style={{ fontSize: "0.8rem" }}>{String(item.nomorSurat ?? "")}</td>
                        <td>{String(item.pengirim ?? "")}</td>
                        <td>{String(item.perihal ?? "")}</td>
                        <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{String(item.tanggalSurat ?? "")}</td>
                        <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{String(item.tanggalTerima ?? "")}</td>
                        <td><span className="badge bg-secondary">{String(item.status ?? "")}</span></td>
                        <td>{String(item.categoryName ?? "-")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr><td colSpan={8} className="fw-bold text-end">Total: {currentReport?.total ?? 0} surat</td></tr>
                </tfoot>
              </table>
            ) : (
              <table className="table table-striped table-hover vaultix-table mb-0">
                <thead>
                  <tr><th>No</th><th>Nomor Surat</th><th>Tujuan</th><th>Perihal</th><th>Tgl Surat</th><th>Status</th><th>Kategori</th></tr>
                </thead>
                <tbody>
                  {((currentReport?.items ?? []) as ReportItem[]).length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-3 text-muted">Tidak ada data dalam periode ini</td></tr>
                  ) : (
                    ((currentReport?.items ?? []) as ReportItem[]).map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold" style={{ fontSize: "0.8rem" }}>{String(item.nomorSurat ?? "")}</td>
                        <td>{String(item.tujuan ?? "")}</td>
                        <td>{String(item.perihal ?? "")}</td>
                        <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{String(item.tanggalSurat ?? "")}</td>
                        <td><span className="badge bg-secondary">{String(item.status ?? "")}</span></td>
                        <td>{String(item.categoryName ?? "-")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr><td colSpan={7} className="fw-bold text-end">Total: {currentReport?.total ?? 0} surat</td></tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Monthly recap */}
      <div className="vaultix-card p-4">
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Rekap Bulanan Tahun {year}</h3>
        <div className="table-responsive">
          <table className="table table-hover vaultix-table mb-0">
            <thead>
              <tr><th>Bulan</th><th>Surat Masuk</th><th>Surat Keluar</th><th>Total</th></tr>
            </thead>
            <tbody>
              {(monthly as { month: string; masuk: number; keluar: number }[]).map((m, i) => (
                <tr key={i}>
                  <td className="fw-semibold">{m.month}</td>
                  <td><span className="badge" style={{ background: "hsl(217 91% 60%)", color: "white" }}>{m.masuk}</span></td>
                  <td><span className="badge" style={{ background: "hsl(160 60% 45%)", color: "white" }}>{m.keluar}</span></td>
                  <td className="fw-bold">{m.masuk + m.keluar}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-dark">
                <td className="fw-bold">TOTAL</td>
                <td className="fw-bold">{(monthly as { masuk: number }[]).reduce((a, m) => a + m.masuk, 0)}</td>
                <td className="fw-bold">{(monthly as { keluar: number }[]).reduce((a, m) => a + m.keluar, 0)}</td>
                <td className="fw-bold">{(monthly as { masuk: number; keluar: number }[]).reduce((a, m) => a + m.masuk + m.keluar, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Layout>
  );
}
