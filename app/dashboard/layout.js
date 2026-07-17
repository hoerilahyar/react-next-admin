import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <Navbar />
          <main className="dashboard-main">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
