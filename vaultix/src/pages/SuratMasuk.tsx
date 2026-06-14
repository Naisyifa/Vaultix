import { useState } from "react";
import { Plus, Pencil, Trash2, Download, Search, ArrowUpDown } from "lucide-react";
import {
  useListSuratMasuk, useCreateSuratMasuk, useUpdateSuratMasuk, useDeleteSuratMasuk,
  useListCategories, getListSuratMasukQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { apiFetch } from "@/lib/api";

type SuratMasukItem = {
  id: number; nomorSurat: string; pengirim: string; perihal: string;
  tanggalSurat: string; tanggalTerima: string; categoryId: number | null;
  categoryName: string | null; status: string; keterangan: string | null;
  fileUrl: string | null; fileName: string | null; createdAt: string;
};

const STATUS_OPTIONS = ["baru", "diproses", "selesai", "arsip"];

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    baru: "badge-baru", diproses: "badge-diproses", selesai: "badge-selesai", arsip: "badge-arsip"
  };
  return <span className={`badge ${cls[status] ?? "bg-secondary"}`}>{status}</span>;
}

function ModalForm({
  show, onClose, onSubmit, initial, categories, loading
}: {
  show: boolean; onClose: () => void;
  onSubmit: (fd: FormData) => void;
  initial?: Partial<SuratMasukItem>;
  categories: { id: number; name: string }[];
  loading: boolean;
}) {
  if (!show) return null;
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit(fd);
  }
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{initial?.id ? "Edit Surat Masuk" : "Tambah Surat Masuk"}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nomor Surat *</label>
                  <input name="nomorSurat" className="form-control" defaultValue={initial?.nomorSurat} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Pengirim *</label>
                  <input name="pengirim" className="form-control" defaultValue={initial?.pengirim} required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Perihal *</label>
                  <input name="perihal" className="form-control" defaultValue={initial?.perihal} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tanggal Surat *</label>
                  <input name="tanggalSurat" type="date" className="form-control" defaultValue={initial?.tanggalSurat} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tanggal Terima *</label>
                  <input name="tanggalTerima" type="date" className="form-control" defaultValue={initial?.tanggalTerima} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Kategori</label>
                  <select name="categoryId" className="form-select" defaultValue={initial?.categoryId ?? ""}>
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Status *</label>
                  <select name="status" className="form-select" defaultValue={initial?.status ?? "baru"} required>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Keterangan</label>
                  <textarea name="keterangan" className="form-control" rows={2} defaultValue={initial?.keterangan ?? ""} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">File Dokumen</label>
                  <input name="file" type="file" className="form-control" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
                  {initial?.fileName && (
                    <div className="form-text">File saat ini: {initial.fileName}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary fw-semibold" disabled={loading} data-testid="button-submit-form">
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                {initial?.id ? "Simpan Perubahan" : "Tambah Data"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SuratMasuk() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [sort, setSort] = useState("terbaru");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SuratMasukItem | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const params = {
    search: search || undefined,
    status: filterStatus || undefined,
    categoryId: filterCat ? parseInt(filterCat) : undefined,
    sort,
  };

  const { data: items = [], isLoading } = useListSuratMasuk(params);
  const { data: categories = [] } = useListCategories();
  const deleteMut = useDeleteSuratMasuk();

  async function handleSubmit(fd: FormData) {
    setSubmitting(true);
    try {
      const method = editing?.id ? "PATCH" : "POST";
      const url = editing?.id ? `/surat-masuk/${editing.id}` : "/surat-masuk";
      await apiFetch(url, { method, body: fd });
      qc.invalidateQueries({ queryKey: getListSuratMasukQueryKey() });
      setShowModal(false);
      setEditing(undefined);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus surat masuk ini?")) return;
    deleteMut.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListSuratMasukQueryKey() }) });
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Surat Masuk</h1>
          <p className="page-subtitle">Kelola arsip surat masuk</p>
        </div>
        <button className="btn btn-primary fw-semibold" onClick={() => { setEditing(undefined); setShowModal(true); }} data-testid="button-tambah-surat-masuk">
          <Plus size={16} className="me-1" /> Tambah Surat
        </button>
      </div>

      {/* Filters */}
      <div className="vaultix-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><Search size={14} /></span>
              <input type="search" className="form-control" placeholder="Cari perihal..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search" />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} data-testid="select-status">
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><ArrowUpDown size={14} /></span>
              <select className="form-select form-select-sm" value={sort} onChange={e => setSort(e.target.value)} data-testid="select-sort">
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="vaultix-card">
        {isLoading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: "hsl(217 91% 60%)" }} /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover vaultix-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>Nomor Surat</th>
                  <th>Pengirim</th>
                  <th>Perihal</th>
                  <th>Tgl Surat</th>
                  <th>Tgl Terima</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>File</th>
                  <th style={{ width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(items as SuratMasukItem[]).length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-4 text-muted">Tidak ada data surat masuk</td></tr>
                ) : (
                  (items as SuratMasukItem[]).map((item, idx) => (
                    <tr key={item.id} data-testid={`row-surat-masuk-${item.id}`}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold" style={{ fontSize: "0.8rem" }}>{item.nomorSurat}</td>
                      <td>{item.pengirim}</td>
                      <td>{item.perihal}</td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>{item.tanggalSurat}</td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>{item.tanggalTerima}</td>
                      <td>{item.categoryName ?? <span className="text-muted">-</span>}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>
                        {item.fileUrl ? (
                          <a href={item.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary btn-action" data-testid={`link-file-${item.id}`}>
                            <Download size={12} className="me-1" />Unduh
                          </a>
                        ) : <span className="text-muted" style={{ fontSize: "0.78rem" }}>-</span>}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-warning btn-action" onClick={() => { setEditing(item); setShowModal(true); }} data-testid={`button-edit-${item.id}`}>
                            <Pencil size={12} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(item.id)} data-testid={`button-delete-${item.id}`}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalForm
        show={showModal}
        onClose={() => { setShowModal(false); setEditing(undefined); }}
        onSubmit={handleSubmit}
        initial={editing}
        categories={categories as { id: number; name: string }[]}
        loading={submitting}
      />
    </Layout>
  );
}
