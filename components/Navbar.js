"use client";

import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    // Ganti dengan navbar/topbar dari template ThemeForest
    <header className="navbar">
      <div className="navbar-title">Dashboard</div>
      <div className="navbar-actions">
        <span className="navbar-user">{user?.name}</span>
        <button onClick={logout} className="btn-secondary">
          Keluar
        </button>
      </div>
    </header>
  );
}
