import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UserLayout({ children }) {
  return (
    <ProtectedRoute permission="log_audit_auth.read">
      <div id="layout-wrapper">
        <Navbar />
        <Sidebar />
        <div className="main-content">
          <div className="page-content">{children}</div>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
