"use client";

import { useEffect, useState } from "react";
import { getRoles } from "@/lib/roles";

export const emptyUserForm = {
  id: null,
  name: "",
  username: "",
  email: "",
  password: "",
  is_active: true,
  roles: [],
};

export default function UserFormModal({
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
  error,
}) {
  const [roleOptions, setRoleOptions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingRoles(true);
      setRolesError(null);
      try {
        const roles = await getRoles();
        if (!cancelled) setRoleOptions(roles);
      } catch (err) {
        if (!cancelled) setRolesError(err.message || "Gagal memuat roles.");
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleRole(name) {
    setForm((prev) => {
      const has = prev.roles.includes(name);
      return {
        ...prev,
        roles: has
          ? prev.roles.filter((r) => r !== name)
          : [...prev.roles, name],
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
                <h5 className="modal-title">{form.id ? "Edit User" : "Add User"}</h5>
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
                  <label className="form-label">Username</label>
                  <input
                    className="form-control"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Password {form.id && <span className="text-muted small">(kosongkan jika tidak diganti)</span>}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    required={!form.id}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Roles</label>

                  {rolesError && (
                    <div className="alert alert-danger py-2">{rolesError}</div>
                  )}

                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: "180px", overflowY: "auto" }}
                  >
                    {loadingRoles && (
                      <div className="text-muted small">Loading roles...</div>
                    )}

                    {!loadingRoles && roleOptions.length === 0 && (
                      <div className="text-muted small">No roles available</div>
                    )}

                    {!loadingRoles &&
                      roleOptions.map((role) => (
                        <div className="form-check" key={role.id}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`role-${role.id}`}
                            checked={form.roles.includes(role.name)}
                            onChange={() => toggleRole(role.name)}
                          />
                          <label className="form-check-label" htmlFor={`role-${role.id}`}>
                            {role.name}
                            {role.description && (
                              <span className="text-muted"> — {role.description}</span>
                            )}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="is_active">Active</label>
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