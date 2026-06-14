import { useState } from "react";
import { Search, ArrowUpDown, Download } from "lucide-react";
import { useListSuratMasuk, useListSuratKeluar, useListCategories } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

type MasukItem = { id: number; nomorSurat: string; pengirim?: string; perihal: string; tanggalSurat: string; status: string; categoryName: string | null };
type KeluarItem = { id: number; nomorSurat: string; tujuan?: string; perihal: string; tanggalSurat: string; status: string; categoryName: string | null };
type ResultItem = { id: number; nomorSurat: string; jenis: string; pihak: string; perihal: string; tanggalSurat: string; status: string; categoryName: string | null };

export default function Filter() {
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("semua");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState("terbaru");
  const [searched, setSearched] = useState(false);

  const { data: categories = [] } = useListCategories();

  const smParams = {
    search: search || undefined,
    categoryId: filterCat ? parseInt(filterCat) : undefined,
    status: filterStatus || undefined,
    sort, startDate: startDate || undefined, endDate: endDate || undefined,
  };
  const skParams = {
    search: search || undefined,
    categoryId: filterCat ? parseInt(filterCat) : undefined,
    status: filterStatus || undefined,
    sort, startDate: startDate || undefined, endDate: endDate || undefined,
  };

  const { data: suratMasuk = [], isLoading: loadingSM } = useListSuratMasuk(
    smParams, { query: { enabled: searched && jenis !== "keluar" } }
  );
  const { data: suratKeluar = [], isLoading: loadingSK } = useListSuratKeluar(
    skParams, { query: { enabled: searched && jenis !== "masuk" } }
  );

  const isLoading = loadingSM || loadingSK;

  let results: ResultItem[] = [];
  if (searched) {
    if (jenis !== "keluar") {
      results = [...results, ...(suratMasuk as MasukItem[]).map(s => ({
        id: s.id, nomorSurat: s.nomorSurat, jenis: "Masuk", pihak: s.pengirim ?? "-",
        perihal: s.perihal, tanggalSurat: s.tanggalSurat, status: s.status, categoryName: s.categoryName
      }))];
    }
    if (jenis !== "masuk") {
      results = [...results, ...(suratKeluar as KeluarItem[]).map(s => ({
        id: s.id, nomorSurat: s.nomorSurat, jenis: "Keluar", pihak: s.tujuan ?? "-",
        perihal: s.perihal, tanggalSurat: s.tanggalSurat, status: s.status, categoryName: s.categoryName
      }))];
    }
    if (sort === "terbaru") results.sort((a, b) => b.tanggalSurat.localeCompare(a.tanggalSurat));
    else results.sort((a, b) => a.tanggalSurat.localeCompare(b.tanggalSurat));
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Filter Lanjutan</h1>
          <p className="page-subtitle">Pencarian dan filter surat secara komprehensif</p>
        </div>
      </div>

      <div className="vaultix-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Kata Kunci</label>
            <div className="input-group">
              <span className="input-group-text"><Search size={14} /></span>
              <input type="search" className="form-control" placeholder="Cari nomor surat, perihal..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-filter" />
            </div>
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Jenis Surat</label>
            <select className="form-select" value={jenis} onChange={e => setJenis(e.target.value)} data-testid="select-jenis">
              <option value="semua">Semua (Masuk & Keluar)</option>
              <option value="masuk">Surat Masuk</option>
              <option value="keluar">Surat Keluar</option>
            </select>
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Kategori</label>
            <select className="form-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Semua Kategori</option>
              {(categories as { id: number; name: string }[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Status</label>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="baru">Baru</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="draft">Draft</option>
              <option value="terkirim">Terkirim</option>
              <option value="arsip">Arsip</option>
            </select>
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Tanggal Mulai</label>
            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Tanggal Akhir</label>
            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Urutan</label>
            <div className="input-group">
              <span className="input-group-text"><ArrowUpDown size={14} /></span>
              <select className="form-select" value={sort} onChange={e => setSort(e.target.value)} data-testid="select-sort-filter">
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
            </div>
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary fw-semibold" onClick={() => setSearched(true)} data-testid="button-cari">
              <Search size={15} className="me-1" /> Cari Surat
            </button>
            <button className="btn btn-outline-secondary" onClick={() => { setSearch(""); setJenis("semua"); setFilterCat(""); setFilterStatus(""); setStartDate(""); setEndDate(""); setSort("terbaru"); setSearched(false); }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <div className="vaultix-card">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
              Hasil Pencarian: <span style={{ color: "hsl(217 91% 50%)" }}>{results.length}</span> surat ditemukan
            </span>
          </div>
          {isLoading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: "hsl(217 91% 60%)" }} /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover vaultix-table mb-0">
                <thead>
                  <tr><th>No</th><th>Jenis</th><th>Nomor Surat</th><th>Pengirim/Tujuan</th><th>Perihal</th><th>Tanggal</th><th>Kategori</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-4 text-muted">Tidak ada surat yang sesuai</td></tr>
                  ) : (
                    results.map((item, idx) => (
                      <tr key={`${item.jenis}-${item.id}`}>
                        <td>{idx + 1}</td>
                        <td><span className={`badge ${item.jenis === "Masuk" ? "bg-primary" : "bg-success"}`}>{item.jenis}</span></td>
                        <td className="fw-semibold" style={{ fontSize: "0.8rem" }}>{item.nomorSurat}</td>
                        <td>{item.pihak}</td>
                        <td>{item.perihal}</td>
                        <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>{item.tanggalSurat}</td>
                        <td>{item.categoryName ?? "-"}</td>
                        <td><span className="badge bg-secondary">{item.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
