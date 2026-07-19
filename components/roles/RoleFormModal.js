"use client";

import { useEffect, useState } from "react";
import { getPermissions } from "@/lib/permissions";

export const emptyRoleForm = {
  id: null,
  name: "",
  description: "",
  permissions: [],
};

export default function RoleFormModal({
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
  error,
}) {
  const [permissionOptions, setPermissionOptions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [permissionsError, setPermissionsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingPermissions(true);
      setPermissionsError(null);
      try {
        const permissions = await getPermissions();
        if (!cancelled) setPermissionOptions(permissions);
      } catch (err) {
        if (!cancelled) setPermissionsError(err.message || "Gagal memuat permissions.");
      } finally {
        if (!cancelled) setLoadingPermissions(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function togglePermission(name) {
    setForm((prev) => {
      const has = prev.permissions.includes(name);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== name)
          : [...prev.permissions, name],
      };
    });
  }

  return (
    <>
      <div className="modal show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{form.id ? "Edit Role" : "Add Role"}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <input
                    className="form-control"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Permissions</label>

                  {permissionsError && (
                    <div className="alert alert-danger py-2">{permissionsError}</div>
                  )}

                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: "180px", overflowY: "auto" }}
                  >
                    {loadingPermissions && (
                      <div className="text-muted small">Loading permissions...</div>
                    )}

                    {!loadingPermissions && permissionOptions.length === 0 && (
                      <div className="text-muted small">No permissions available</div>
                    )}

                    {!loadingPermissions &&
                      permissionOptions.map((perm) => (
                        <div className="form-check" key={perm.id}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`perm-${perm.id}`}
                            checked={form.permissions.includes(perm.name)}
                            onChange={() => togglePermission(perm.name)}
                          />
                          <label className="form-check-label" htmlFor={`perm-${perm.id}`}>
                            {perm.name}
                            {perm.description && (
                              <span className="text-muted"> — {perm.description}</span>
                            )}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>

              </div>
              <div className="modal-footer d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-primary w-auto" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" className="btn btn-secondary w-auto" onClick={onClose}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}