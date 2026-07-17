"use client";

import Link from "next/link";

const menuItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  return (
    // Ganti dengan komponen sidebar dari template ThemeForest.
    // Cukup arahkan link menu ke route yang sesuai di app/dashboard/...
    <aside className="sidebar">
      <div className="sidebar-logo">MyApp</div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="sidebar-link">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
