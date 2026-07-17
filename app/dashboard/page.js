"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Ganti section ini dengan widget/kartu statistik dari template ThemeForest */}
      <h2>Selamat datang, {user?.name} 👋</h2>
      <p>Ini adalah halaman overview dashboard. Ganti konten ini dengan komponen dari template Anda.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">1,204</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Revenue</span>
          <span className="stat-value">Rp 45.000.000</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Orders</span>
          <span className="stat-value">318</span>
        </div>
      </div>
    </div>
  );
}
