"use client";

import { useEffect, useState } from "react";
import {
  getMasterGroup,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
} from "@/lib/masters";

const emptyItemForm = {
  id: null,
  code: "",
  name: "",
  description: "",
  extra: "",
  sort_order: 0,
  is_active: true,
};

export default function MasterItemsModal({ groupId, onClose, onChanged }) {
  const [group, setGroup] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState(null);

  async function loadGroup() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getMasterGroup(groupId);
      const data = res?.data ?? res;
      setGroup(data);
      setItems(data?.items ?? []);
    } catch (err) {
      setLoadError(err.message || "Gagal memuat items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  function openAddItemForm() {
    setItemForm({ ...emptyItemForm, sort_order: items.length + 1 });
    setItemError(null);
    setShowItemForm(true);
  }

  function openEditItemForm(item) {
    setItemForm({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description ?? "",
      extra: item.extra ?? "",
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setItemError(null);
    setShowItemForm(true);
  }

  async function handleItemSubmit(e) {
    e.preventDefault();
    setSavingItem(true);
    setItemError(null);

    const payload = {
      code: itemForm.code,
      name: itemForm.name,
      description: itemForm.description || null,
      extra: itemForm.extra || null,
      sort_order: Number(itemForm.sort_order),
      is_active: itemForm.is_active,
    };

    try {
      if (itemForm.id) {
        await updateMasterItem(itemForm.id, payload);
      } else {
        await createMasterItem(groupId, payload);
      }
      setShowItemForm(false);
      await loadGroup();
      onChanged?.();
    } catch (err) {
      setItemError(err.message || "Gagal menyimpan item");
    } finally {
      setSavingItem(false);
    }
  }

  async function handleDeleteItem(item) {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: `Delete item "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#51d28c",
      cancelButtonColor: "#f34e4e",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!confirmed.isConfirmed) return;

    try {
      await deleteMasterItem(item.id);
      await loadGroup();
      onChanged?.();
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete item.",
        icon: "error",
        confirmButtonColor: "#f34e4e",
      });
    }
  }

  return (
    <>
      <div className="modal show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Manage Items {group ? `— ${group.name}` : ""}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {loadError && <div className="alert alert-danger">{loadError}</div>}

              <div className="d-flex justify-content-end mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={openAddItemForm}
                  disabled={loading}
                >
                  <i className="bx bx-plus me-1"></i> Add Item
                </button>
              </div>

              {loading ? (
                <div className="text-muted small">Loading items...</div>
              ) : items.length === 0 ? (
                <div className="text-muted small">No items yet</div>
              ) : (
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Sort</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .slice()
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((item) => (
                        <tr key={item.id}>
                          <td>{item.code}</td>
                          <td>{item.name}</td>
                          <td>{item.description || "-"}</td>
                          <td>{item.sort_order}</td>
                          <td>{item.is_active ? "Active" : "Inactive"}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm text-primary px-2"
                              onClick={() => openEditItemForm(item)}
                              aria-label="Edit"
                            >
                              <i className="bx bx-pencil"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm text-danger px-2"
                              onClick={() => handleDeleteItem(item)}
                              aria-label="Delete"
                            >
                              <i className="bx bx-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary w-auto" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>

      {showItemForm && (
        <>
          <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ zIndex: 1060 }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <form onSubmit={handleItemSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {itemForm.id ? "Edit Item" : "Add Item"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowItemForm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {itemError && <div className="alert alert-danger">{itemError}</div>}

                    <div className="mb-3">
                      <label className="form-label">Code</label>
                      <input
                        className="form-control"
                        required
                        value={itemForm.code}
                        onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        required
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <input
                        className="form-control"
                        value={itemForm.description}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Extra</label>
                      <input
                        className="form-control"
                        value={itemForm.extra}
                        onChange={(e) => setItemForm({ ...itemForm, extra: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Sort Order</label>
                      <input
                        type="number"
                        className="form-control"
                        value={itemForm.sort_order}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, sort_order: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="item_is_active"
                        checked={itemForm.is_active}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, is_active: e.target.checked })
                        }
                      />
                      <label className="form-check-label" htmlFor="item_is_active">
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer d-flex justify-content-end gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-auto"
                      disabled={savingItem}
                    >
                      {savingItem ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary w-auto"
                      onClick={() => setShowItemForm(false)}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1055 }}></div>
        </>
      )}
    </>
  );
}