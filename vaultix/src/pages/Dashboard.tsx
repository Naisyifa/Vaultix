import { Mail, Send, Tag, Users, AlertCircle, FileEdit } from "lucide-react";
import { useGetDashboardStats, useGetMonthlyStats } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | undefined; icon: React.ElementType; color: string }) {
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className="stat-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "hsl(215 20% 50%)", marginBottom: "0.5rem", fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "hsl(222 47% 11%)", margin: 0, lineHeight: 1 }}>
              {value ?? <span className="placeholder col-4" />}
            </p>
          </div>
          <div style={{ background: `${color}18`, borderRadius: "0.5rem", padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={20} color={color} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: monthly } = useGetMonthlyStats();

  return (
    <Layout>
      {/* Institution Info */}
      <div className="vaultix-card p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h2 style={{ fontWeight: 800, color: "hsl(222 47% 11%)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              Universitas Negeri Jakarta
            </h2>
            <p style={{ color: "hsl(215 20% 40%)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
              Universitas Negeri Jakarta merupakan perguruan tinggi negeri yang berkomitmen dalam pengembangan pendidikan, penelitian, dan transformasi digital di lingkungan akademik.
            </p>
            <p style={{ color: "hsl(215 20% 40%)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1rem" }}>
              Melalui aplikasi Vaultix, sistem arsip dokumen digital dapat membantu penyimpanan, pengelolaan, dan akses dokumen akademik secara lebih terstruktur dan efisien.
            </p>
            <div style={{ background: "hsl(217 91% 97%)", borderRadius: "0.5rem", padding: "0.75rem 1rem", display: "inline-block", borderLeft: "3px solid hsl(217 91% 60%)" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "hsl(217 91% 30%)", marginBottom: "0.25rem" }}>Tim Pengembang</p>
              <p style={{ fontSize: "0.78rem", color: "hsl(215 20% 45%)", margin: 0 }}>
                Program Studi S1 Pendidikan Administrasi Perkantoran &bull; Kelompok 7
              </p>
              <p style={{ fontSize: "0.78rem", color: "hsl(215 20% 45%)", margin: "0.25rem 0 0" }}>
                Fiana Febianti &bull; Marsya Adelia &bull; Naisyifa Ravenny Fauzizah
              </p>
            </div>
          </div>
          <div className="col-md-4 text-end d-none d-md-block">
            <div style={{ background: "linear-gradient(135deg, hsl(222 47% 14%), hsl(217 91% 35%))", borderRadius: "0.75rem", padding: "1.5rem", color: "white", textAlign: "center" }}>
              <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>UNJ</p>
              <p style={{ fontSize: "0.75rem", opacity: 0.8, margin: "0.25rem 0 0" }}>Universitas Negeri Jakarta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan data arsip surat</p>
        </div>
      </div>

      {statsLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" style={{ color: "hsl(217 91% 60%)" }} role="status" />
        </div>
      ) : (
        <div className="row g-3 mb-4">
          <StatCard label="Total Surat Masuk" value={stats?.totalSuratMasuk} icon={Mail} color="#3b82f6" />
          <StatCard label="Total Surat Keluar" value={stats?.totalSuratKeluar} icon={Send} color="#10b981" />
          <StatCard label="Kategori" value={stats?.totalCategories} icon={Tag} color="#8b5cf6" />
          <StatCard label="Pengguna" value={stats?.totalUsers} icon={Users} color="#f59e0b" />
          <StatCard label="Surat Baru" value={stats?.suratMasukBaru} icon={AlertCircle} color="#ef4444" />
          <StatCard label="Draft Keluar" value={stats?.suratKeluarDraft} icon={FileEdit} color="#6b7280" />
        </div>
      )}

      {/* Chart */}
      <div className="vaultix-card p-4">
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "hsl(222 47% 11%)", marginBottom: "1.25rem" }}>
          Statistik Bulanan {new Date().getFullYear()}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthly ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="masuk" name="Surat Masuk" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="keluar" name="Surat Keluar" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}
