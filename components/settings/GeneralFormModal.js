"use client";

export const emptyGeneralForm = {
  id: null,
  key: "",
  value: "",
  description: "",
};

export default function GeneralFormModal({
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
  error,
}) {

  return (
    <>
      <div className="modal show d-block" tabIndex={-1} setting-general="dialog">
        <div className="modal-dialog" setting-general="document">
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{form.id ? "Edit Settings" : "Add Settings"}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label className="form-label">Key</label>
                  <input
                    className="form-control"
                    required
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Value</label>
                  <input
                    className="form-control"
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
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