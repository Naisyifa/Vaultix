import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";

type Category = { id: number; name: string; description: string | null; createdAt: string };

function ModalForm({ show, onClose, onSubmit, initial, loading }: {
  show: boolean; onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  initial?: Partial<Category>; loading: boolean;
}) {
  if (!show) return null;
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{initial?.id ? "Edit Kategori" : "Tambah Kategori"}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget as HTMLFormElement); onSubmit({ name: fd.get("name") as string, description: fd.get("description") as string }); }}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Nama Kategori *</label>
                <input name="name" className="form-control" defaultValue={initial?.name} required placeholder="Misal: Surat Dinas, Surat Undangan..." />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Deskripsi</label>
                <textarea name="description" className="form-control" rows={3} defaultValue={initial?.description ?? ""} placeholder="Deskripsi singkat kategori ini..." />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary fw-semibold" disabled={loading} data-testid="button-submit-kategori">
                {loading && <span className="spinner-border spinner-border-sm me-1" />}
                {initial?.id ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Kategori() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);

  const { data: categories = [], isLoading } = useListCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const loading = createMut.isPending || updateMut.isPending;

  function handleSubmit(data: { name: string; description: string }) {
    if (editing?.id) {
      updateMut.mutate({ id: editing.id, data }, {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); setShowModal(false); setEditing(undefined); }
      });
    } else {
      createMut.mutate({ data }, {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); setShowModal(false); }
      });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus kategori ini?")) return;
    deleteMut.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }) });
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori Surat</h1>
          <p className="page-subtitle">Kelola kategori untuk pengarsipan surat</p>
        </div>
        <button className="btn btn-primary fw-semibold" onClick={() => { setEditing(undefined); setShowModal(true); }} data-testid="button-tambah-kategori">
          <Plus size={16} className="me-1" /> Tambah Kategori
        </button>
      </div>

      <div className="vaultix-card">
        {isLoading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: "hsl(217 91% 60%)" }} /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover vaultix-table mb-0">
              <thead>
                <tr><th>No</th><th>Nama Kategori</th><th>Deskripsi</th><th>Dibuat</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {(categories as Category[]).length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">Belum ada kategori</td></tr>
                ) : (
                  (categories as Category[]).map((cat, idx) => (
                    <tr key={cat.id} data-testid={`row-kategori-${cat.id}`}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{cat.name}</td>
                      <td className="text-muted" style={{ fontSize: "0.875rem" }}>{cat.description ?? "-"}</td>
                      <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{new Date(cat.createdAt).toLocaleDateString("id-ID")}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-warning btn-action" onClick={() => { setEditing(cat); setShowModal(true); }} data-testid={`button-edit-kategori-${cat.id}`}>
                            <Pencil size={12} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(cat.id)} data-testid={`button-delete-kategori-${cat.id}`}>
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

      <ModalForm show={showModal} onClose={() => { setShowModal(false); setEditing(undefined); }}
        onSubmit={handleSubmit} initial={editing} loading={loading} />
    </Layout>
  );
}
