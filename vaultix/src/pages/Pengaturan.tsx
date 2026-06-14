import { useState } from "react";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";

type UserItem = { id: number; username: string; fullName: string; email: string; jabatan: string | null; organisasi: string | null; role: string; createdAt: string };

const ROLES = ["admin", "staff", "viewer"];

function RoleBadge({ role }: { role: string }) {
  const cls: Record<string, string> = { admin: "badge-admin", staff: "badge-staff", viewer: "badge-viewer" };
  return <span className={`badge ${cls[role] ?? "bg-secondary"}`}>{role}</span>;
}

function ModalForm({ show, onClose, onSubmit, initial, loading }: {
  show: boolean; onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  initial?: Partial<UserItem>; loading: boolean;
}) {
  if (!show) return null;
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{initial?.id ? "Edit Pengguna" : "Tambah Pengguna"}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const data: Record<string, string> = {};
            fd.forEach((v, k) => { if (v) data[k] = v as string; });
            onSubmit(data);
          }}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Username *</label>
                  <input name="username" className="form-control" defaultValue={initial?.username} required disabled={!!initial?.id} placeholder="adminvaultix" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nama Lengkap *</label>
                  <input name="fullName" className="form-control" defaultValue={initial?.fullName} required placeholder="Nama Lengkap" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email *</label>
                  <input name="email" type="email" className="form-control" defaultValue={initial?.email} required placeholder="email@example.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Role *</label>
                  <select name="role" className="form-select" defaultValue={initial?.role ?? "staff"} required>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Jabatan</label>
                  <input name="jabatan" className="form-control" defaultValue={initial?.jabatan ?? ""} placeholder="Staff Administrasi" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nama Organisasi</label>
                  <input name="organisasi" className="form-control" defaultValue={initial?.organisasi ?? ""} placeholder="Universitas Negeri Jakarta" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">{initial?.id ? "Password Baru" : "Password *"}</label>
                  <input name="password" type="password" className="form-control" required={!initial?.id} placeholder={initial?.id ? "Kosongkan jika tidak diubah" : "Password"} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary fw-semibold" disabled={loading} data-testid="button-submit-user">
                {loading && <span className="spinner-border spinner-border-sm me-1" />}
                {initial?.id ? "Simpan" : "Tambah Pengguna"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Pengaturan() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UserItem | undefined>(undefined);

  const { data: users = [], isLoading } = useListUsers();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();
  const loading = createMut.isPending || updateMut.isPending;

  function handleSubmit(data: Record<string, string>) {
    if (editing?.id) {
      updateMut.mutate({ id: editing.id, data }, {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); setShowModal(false); setEditing(undefined); }
      });
    } else {
      createMut.mutate({ data: data as Parameters<typeof createMut.mutate>[0]["data"] }, {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); setShowModal(false); }
      });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus pengguna ini?")) return;
    deleteMut.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() }) });
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Pengguna</h1>
          <p className="page-subtitle">Kelola akun pengguna dan hak akses</p>
        </div>
        <button className="btn btn-primary fw-semibold" onClick={() => { setEditing(undefined); setShowModal(true); }} data-testid="button-tambah-user">
          <Plus size={16} className="me-1" /> Tambah Pengguna
        </button>
      </div>

      {/* Hak Akses Info */}
      <div className="row g-3 mb-4">
        {[
          { role: "admin", color: "#ef4444", desc: "Akses penuh: input, edit, hapus, lihat semua data dan pengaturan pengguna." },
          { role: "staff", color: "#3b82f6", desc: "Dapat input dan edit data surat. Tidak dapat menghapus atau mengelola pengguna." },
          { role: "viewer", color: "#6b7280", desc: "Hanya dapat melihat data surat. Tidak dapat input, edit, atau hapus." },
        ].map(({ role, color, desc }) => (
          <div className="col-md-4" key={role}>
            <div className="vaultix-card p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Shield size={18} color={color} />
                <span className="fw-bold" style={{ textTransform: "capitalize", color }}>{role}</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "hsl(215 20% 45%)", margin: 0 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="vaultix-card">
        {isLoading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: "hsl(217 91% 60%)" }} /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover vaultix-table mb-0">
              <thead>
                <tr><th>No</th><th>Username</th><th>Nama Lengkap</th><th>Email</th><th>Jabatan</th><th>Organisasi</th><th>Role</th><th>Bergabung</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {(users as UserItem[]).length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-4 text-muted">Belum ada pengguna</td></tr>
                ) : (
                  (users as UserItem[]).map((user, idx) => (
                    <tr key={user.id} data-testid={`row-user-${user.id}`}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{user.username}</td>
                      <td>{user.fullName}</td>
                      <td style={{ fontSize: "0.8rem" }}>{user.email}</td>
                      <td>{user.jabatan ?? "-"}</td>
                      <td style={{ fontSize: "0.8rem" }}>{user.organisasi ?? "-"}</td>
                      <td><RoleBadge role={user.role} /></td>
                      <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-warning btn-action" onClick={() => { setEditing(user); setShowModal(true); }} data-testid={`button-edit-user-${user.id}`}>
                            <Pencil size={12} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(user.id)} data-testid={`button-delete-user-${user.id}`}>
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
