import { useState } from "react";
import { User, Mail, Briefcase, Building, Calendar, Save } from "lucide-react";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { setAuth, getStoredUser } from "@/lib/auth";
import Layout from "@/components/Layout";
import logoPath from "@assets/WhatsApp_Image_2026-06-11_at_18.04.25_1781176773295.jpeg";

export default function Profil() {
  const qc = useQueryClient();
  const { data: user, isLoading } = useGetCurrentUser();
  const stored = getStoredUser();
  const displayUser = user ?? stored;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const fd = new FormData(e.currentTarget);
      const data: Record<string, string> = {};
      fd.forEach((v, k) => { if (v) data[k] = v as string; });
      const res = await apiFetch(`/users/${displayUser?.id}`, { method: "PATCH", body: JSON.stringify(data) });
      if (res.ok) {
        const updated = await res.json();
        setAuth(localStorage.getItem("vaultix_token") ?? "", updated);
        qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        setEditing(false);
        setMsg("Profil berhasil diperbarui.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Pengguna</h1>
          <p className="page-subtitle">Informasi akun dan pengaturan profil</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: "hsl(217 91% 60%)" }} /></div>
      ) : (
        <div className="row g-4">
          {/* Profile card */}
          <div className="col-md-4">
            <div className="vaultix-card p-4 text-center">
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, hsl(222 47% 20%), hsl(217 91% 45%))", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {displayUser?.photoUrl ? (
                  <img src={displayUser.photoUrl} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "white" }}>
                    {displayUser?.fullName?.[0]?.toUpperCase() ?? "A"}
                  </span>
                )}
              </div>
              <h4 className="fw-bold mb-1" data-testid="text-fullname">{displayUser?.fullName}</h4>
              <span className={`badge mb-2 badge-${displayUser?.role ?? "staff"}`}>{displayUser?.role}</span>
              <p className="text-muted mb-3" style={{ fontSize: "0.875rem" }} data-testid="text-email">{displayUser?.email}</p>

              <div style={{ borderTop: "1px solid hsl(214 20% 90%)", paddingTop: "1rem", textAlign: "left" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Briefcase size={15} color="hsl(215 20% 50%)" />
                  <span style={{ fontSize: "0.875rem" }}>{displayUser?.jabatan ?? "Tidak ada jabatan"}</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Building size={15} color="hsl(215 20% 50%)" />
                  <span style={{ fontSize: "0.875rem" }}>{displayUser?.organisasi ?? "Tidak ada organisasi"}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={15} color="hsl(215 20% 50%)" />
                  <span style={{ fontSize: "0.875rem" }}>
                    {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <img src={logoPath} alt="Vaultix" style={{ width: 40, opacity: 0.5 }} />
                <p style={{ fontSize: "0.7rem", color: "hsl(215 20% 60%)", margin: "0.25rem 0 0" }}>Vaultix Digital Archive</p>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="col-md-8">
            <div className="vaultix-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Detail Profil</h5>
                {!editing && (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>Edit Profil</button>
                )}
              </div>

              {msg && <div className="alert alert-success alert-sm">{msg}</div>}

              {editing ? (
                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Nama Lengkap</label>
                      <div className="input-group">
                        <span className="input-group-text"><User size={14} /></span>
                        <input name="fullName" className="form-control" defaultValue={displayUser?.fullName} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Email</label>
                      <div className="input-group">
                        <span className="input-group-text"><Mail size={14} /></span>
                        <input name="email" type="email" className="form-control" defaultValue={displayUser?.email} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Jabatan</label>
                      <div className="input-group">
                        <span className="input-group-text"><Briefcase size={14} /></span>
                        <input name="jabatan" className="form-control" defaultValue={displayUser?.jabatan ?? ""} placeholder="Staff Administrasi" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Nama Organisasi</label>
                      <div className="input-group">
                        <span className="input-group-text"><Building size={14} /></span>
                        <input name="organisasi" className="form-control" defaultValue={displayUser?.organisasi ?? ""} placeholder="Universitas Negeri Jakarta" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Password Baru</label>
                      <input name="password" type="password" className="form-control" placeholder="Kosongkan jika tidak diubah" />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary fw-semibold" disabled={saving} data-testid="button-save-profil">
                      {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <Save size={15} className="me-1" />}
                      Simpan Perubahan
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Batal</button>
                  </div>
                </form>
              ) : (
                <div className="row g-3">
                  {[
                    { label: "Username", icon: User, value: displayUser?.username },
                    { label: "Nama Lengkap", icon: User, value: displayUser?.fullName },
                    { label: "Email", icon: Mail, value: displayUser?.email },
                    { label: "Jabatan", icon: Briefcase, value: displayUser?.jabatan ?? "-" },
                    { label: "Nama Organisasi", icon: Building, value: displayUser?.organisasi ?? "-" },
                    { label: "Tanggal Bergabung", icon: Calendar, value: displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-" },
                  ].map(({ label, icon: Icon, value }) => (
                    <div className="col-md-6" key={label}>
                      <label style={{ fontSize: "0.75rem", color: "hsl(215 20% 50%)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Icon size={15} color="hsl(217 91% 60%)" />
                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "hsl(222 47% 11%)" }}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
