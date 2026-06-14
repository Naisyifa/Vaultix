import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Mail, Send, Tag, Filter, FileText,
  Settings, User, LogOut, Menu, X, ChevronRight
} from "lucide-react";
import { clearAuth, getStoredUser } from "@/lib/auth";
import logoPath from "@assets/WhatsApp_Image_2026-06-11_at_18.04.25_1781176773295.jpeg";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/surat-masuk", label: "Surat Masuk", icon: Mail },
  { path: "/surat-keluar", label: "Surat Keluar", icon: Send },
  { path: "/kategori", label: "Kategori Surat", icon: Tag },
  { path: "/filter", label: "Filter Lanjutan", icon: Filter },
  { path: "/laporan", label: "Laporan", icon: FileText },
  { path: "/pengaturan", label: "Pengaturan Pengguna", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getStoredUser();

  function handleLogout() {
    clearAuth();
    window.location.href = "/";
  }

  const sidebarClass = `vaultix-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClass}>
        <div className="sidebar-logo">
          <img src={logoPath} alt="Vaultix Logo" />
          {!collapsed && <span>Vaultix</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path} className={location === path || location.startsWith(path) ? "active" : ""} onClick={() => setMobileOpen(false)}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "1rem 0.5rem", borderTop: "1px solid hsl(222 40% 18%)" }}>
          <Link href="/profil" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", color: "hsl(210 40% 75%)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
            <User size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName ?? "Profil"}</span>}
          </Link>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", color: "hsl(0 84% 70%)", background: "none", border: "none", fontSize: "0.875rem", fontWeight: 500, width: "100%", cursor: "pointer" }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="vaultix-main">
        {/* Topbar */}
        <div className="vaultix-topbar no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
            <button
              onClick={() => { setCollapsed(!collapsed); setMobileOpen(!mobileOpen); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: "hsl(215 20% 50%)", display: "flex", alignItems: "center" }}
              data-testid="button-toggle-sidebar"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "hsl(215 20% 50%)", fontSize: "0.875rem" }}>
              <span style={{ fontWeight: 700, color: "hsl(222 47% 11%)", fontSize: "1rem" }}>Vaultix</span>
              <ChevronRight size={14} />
              <span>{NAV_ITEMS.find(n => location.startsWith(n.path))?.label ?? "Dashboard"}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/profil" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "hsl(222 47% 11%)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "hsl(217 91% 60%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.875rem", fontWeight: 600 }}>
                {user?.fullName?.[0]?.toUpperCase() ?? "A"}
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{user?.fullName ?? "Admin"}</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger" data-testid="button-logout">
              <LogOut size={14} className="me-1" />
              Keluar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="vaultix-content">
          {children}
        </div>
      </div>
    </div>
  );
}
