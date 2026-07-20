"use client";

export const emptyMenuForm = {
  id: null,
  parent_id: null,
  name: "",
  slug: "",
  path: "",
  icon: "",
  order_index: "",
  is_active: true,
  permissions: [],
};

function buildParentLabel(menu, depth) {
  const indent = depth > 0 ? "— ".repeat(depth) : "";
  return `${indent}${menu.name}`;
}

export default function MenuFormModal({
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
  error,
  parentOptions = [],
  permissionOptions = [],
}) {
  function togglePermission(id) {
    setForm((prev) => {
      const has = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== id)
          : [...prev.permissions, id],
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
                <h5 className="modal-title">{form.id ? "Edit Menu" : "Add Menu"}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label className="form-label">Parent Menu</label>
                  <select
                    className="form-select"
                    value={form.parent_id ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        parent_id: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  >
                    <option value="">— Top Level (No Parent) —</option>
                    {parentOptions.map(({ menu, depth }) => (
                      <option key={menu.id} value={menu.id}>
                        {buildParentLabel(menu, depth)}
                      </option>
                    ))}
                  </select>
                </div>

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
                  <label className="form-label">Slug</label>
                  <input
                    className="form-control"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Path</label>
                  <input
                    className="form-control"
                    value={form.path}
                    onChange={(e) => setForm({ ...form, path: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Icon</label>
                  <input
                    className="form-control"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Permissions</label>
                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: "180px", overflowY: "auto" }}
                  >
                    {permissionOptions.length === 0 && (
                      <div className="text-muted small">No permissions available</div>
                    )}
                    {permissionOptions.map((perm) => (
                      <div className="form-check" key={perm.id}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`perm-${perm.id}`}
                          checked={form.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
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