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
  permissions: "",
};

export default function MenuFormModal({ form, setForm, onSubmit, onClose, saving, error }) {
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
                  <label className="form-label">
                    Permissions (pisahkan dengan spasi)
                  </label>
                  <input
                    className="form-control"
                    value={form.permissions}
                    onChange={(e) => {
                      let value = e.target.value;

                      value = value.replace(/\s+/g, ", ");

                      value = value.replace(/,\s*,+/g, ", ");

                      setForm({
                        ...form,
                        permissions: value,
                      });
                    }}
                  />
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
                <button
                  type="submit"
                  className="btn btn-primary w-auto"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary w-auto"
                  onClick={onClose}
                >
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