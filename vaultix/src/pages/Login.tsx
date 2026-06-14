import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { setAuth } from "@/lib/auth";
import logoPath from "@assets/WhatsApp_Image_2026-06-11_at_18.04.25_1781176773295.jpeg";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        setSuccess(true);
        setTimeout(() => setLocation("/dashboard"), 1500);
      },
      onError: () => {
        setError("Username atau password salah. Silakan coba lagi.");
      },
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ data: { username, password } });
  }

  return (
    <div className="login-bg d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: 480, padding: "1rem" }}>
        <div className="login-card">
          {/* Logo */}
          <div className="text-center mb-4">
            <img src={logoPath} alt="Vaultix" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: "1rem" }} />
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "hsl(222 47% 11%)", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
              Vaultix
            </h1>
            <p style={{ color: "hsl(215 20% 50%)", fontSize: "0.875rem", marginBottom: 0 }}>
              Sistem Arsip Dokumen Digital
            </p>
          </div>

          {/* Welcome text */}
          <div style={{ background: "hsl(217 91% 97%)", borderRadius: "0.625rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", borderLeft: "3px solid hsl(217 91% 60%)" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(217 91% 30%)", marginBottom: "0.5rem" }}>
              Selamat Datang di Vaultix
            </p>
            <p style={{ fontSize: "0.8rem", color: "hsl(215 20% 45%)", margin: 0, lineHeight: 1.6 }}>
              Vaultix adalah aplikasi sederhana untuk membantu pengelolaan dokumen kantor secara digital. Aplikasi ini memiliki fitur input dokumen, penyimpanan data, daftar dokumen, serta fitur membuka file dokumen.
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div className="alert alert-success d-flex align-items-center mb-3" role="alert" data-testid="alert-success">
              <strong>Selamat Datang di Vaultix!</strong>&nbsp;Mengalihkan ke dashboard...
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="alert alert-danger mb-3" role="alert" data-testid="alert-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Username</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <User size={16} color="hsl(215 20% 50%)" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  data-testid="input-username"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: "0.875rem" }}>Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Lock size={16} color="hsl(215 20% 50%)" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={16} color="hsl(215 20% 50%)" /> : <Eye size={16} color="hsl(215 20% 50%)" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 fw-semibold"
              disabled={loginMutation.isPending || success}
              style={{ background: "linear-gradient(135deg, hsl(222 47% 20%), hsl(217 91% 40%))", color: "white", padding: "0.625rem", borderRadius: "0.5rem", border: "none", fontSize: "0.9375rem" }}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" />
              ) : null}
              {loginMutation.isPending ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="text-center mt-4" style={{ fontSize: "0.75rem", color: "hsl(215 20% 60%)" }}>
            &copy; {new Date().getFullYear()} Vaultix &mdash; Program Studi S1 Pendidikan Administrasi Perkantoran
          </div>
        </div>
      </div>
    </div>
  );
}
