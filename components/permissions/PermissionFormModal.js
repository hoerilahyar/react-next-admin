"use client";

export const emptyPermissionForm = {
  id: null,
  name: "",
  description: "",
};

export default function PermissionFormModal({
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
  error,
}) {

  return (
    <>
      <div className="modal show d-block" tabIndex={-1} permission="dialog">
        <div className="modal-dialog" permission="document">
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{form.id ? "Edit Permission" : "Add Permission"}</h5>
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