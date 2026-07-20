"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * @param {string} [permission] - permission tunggal yang wajib dimiliki user.
 * @param {string[]} [anyPermission] - user hanya butuh salah satu dari daftar ini.
 *
 * Contoh:
 *   <ProtectedRoute permission="permissions.view">...</ProtectedRoute>
 *   <ProtectedRoute anyPermission={["users.view", "users.manage"]}>...</ProtectedRoute>
 */
export default function ProtectedRoute({ children, permission, anyPermission }) {
  const { user, isLoading, hasPermission, hasAnyPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div className="page-loading" suppressHydrationWarning>Memuat...</div>;
  }

  if (!user) {
    return null;
  }

  const allowed = anyPermission
    ? hasAnyPermission(anyPermission)
    : hasPermission(permission);

  if (!allowed) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card mt-5">
              <div className="card-body text-center py-5">
                <i className="bx bx-lock-alt display-4 text-danger mb-3"></i>
                <h4>Akses Ditolak</h4>
                <p className="text-muted mb-0">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
