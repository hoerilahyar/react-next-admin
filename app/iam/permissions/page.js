"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import { getPermissions, createPermission, updatePermission, deletePermission } from "@/lib/permissions";
import PermissionFormModal, { emptyPermissionForm } from "@/components/permissions/PermissionFormModal";
import { formatDateTime } from "@/lib/helper/format-utils";

const columns = [
  { name: "name", width: "150px" },
  { name: "description", width: "150px" },
  { name: "created_at", width: "180px" },
  { name: "Actions", width: "130px" },
];

function formatRow(permission) {
  return [
    permission.name,
    permission.description,
    formatDateTime(permission.created_at),
  ];
}

export default function PermissionPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const gridjsRef = useRef(null);
  const permissionsRef = useRef([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyPermissionForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const renderGrid = useCallback(async () => {
    const gridjs = await waitForGlobal("gridjs");
    gridjsRef.current = gridjs;

    if (gridInstance.current) return;

    gridInstance.current = new gridjs.Grid({
      columns: [...columns],
      sort: false,
      search: {
        server: {
          url: (prev, keyword) => {
            const url = new URL(prev, window.location.origin);
            if (keyword) url.searchParams.set("search", keyword);
            else url.searchParams.delete("search");
            return url.toString();
          },
        },
      },
      pagination: {
        limit: 20,
        server: {
          url: (prev, page, limit) => {
            const url = new URL(prev, window.location.origin);
            url.searchParams.set("page", page + 1);
            url.searchParams.set("limit", limit);
            return url.toString();
          },
        },
      },
      server: {
        url: "/permissions",
        data: async (opts) => {
          const relativeUrl = opts.url.replace(window.location.origin, "");
          const query = relativeUrl.split("?")[1] ?? "";

          const res = await getPermissions(
            Object.fromEntries(new URLSearchParams(query))
          );

          permissionsRef.current = res.data;

          return {
            data: res.data.map((permission) => [
              ...formatRow(permission),
              gridjsRef.current.html(
                `<div style="white-space: nowrap;">
                    <a
                        href="javascript:void(0);"
                        class="js-edit-permission px-2 text-primary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        aria-label="Edit"
                        data-bs-original-title="Edit"
                        data-id="${permission.id}">
                        <i class="bx bx-pencil font-size-18"></i>
                    </a>
                    <a
                        href="javascript:void(0);"
                        class="js-delete-permission px-2 text-danger"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        aria-label="Delete"
                        data-bs-original-title="Delete"
                        data-id="${permission.id}">
                        <i class="bx bx-trash-alt font-size-18"></i>
                    </a>
                </div>`
              ),
            ]),
            total: res.meta.total,
          };
        },
      },
    }).render(gridRef.current);

    gridInstance.current.on("ready", () => {
      if (window.bootstrap) {
        gridRef.current
          .querySelectorAll('[data-bs-toggle="tooltip"]')
          .forEach((el) => new window.bootstrap.Tooltip(el));
      }
    });
  }, []);

  const refreshGrid = useCallback(() => {
    gridInstance.current?.forceRender();
  }, []);

  useEffect(() => {
    renderGrid().catch(() => { });

    const container = gridRef.current;
    const handleClick = (e) => {
      const editBtn = e.target.closest(".js-edit-permission");
      const deleteBtn = e.target.closest(".js-delete-permission");

      if (editBtn) openEditModal(Number(editBtn.dataset.id));
      if (deleteBtn) handleDelete(Number(deleteBtn.dataset.id));
    };
    container?.addEventListener("click", handleClick);

    return () => {
      container?.removeEventListener("click", handleClick);
      gridInstance.current?.destroy?.();
      gridInstance.current = null;
    };
  }, [renderGrid]);

  function openAddModal() {
    setForm(emptyPermissionForm);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(id) {
    const found = permissionsRef.current.find((permission) => permission.id === id);
    if (!found) return;

    setForm({
      id: found.id,
      name: found.name,
      description: found.description,
    });
    setError(null);
    setShowModal(true);
  }

  async function showDeleteConfirmation() {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#51d28c",
      cancelButtonColor: "#f34e4e",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    return result.isConfirmed;
  }

  async function handleDelete(id) {
    const confirmed = await showDeleteConfirmation();
    if (!confirmed) return;

    try {
      await deletePermission(id);
      await Swal.fire({
        title: "Deleted!",
        text: "Permission has been deleted.",
        icon: "success",
        confirmButtonColor: "#51d28c",
      });
      refreshGrid();
      window.dispatchEvent(new Event("permission-changed"));
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete permission.",
        icon: "error",
        confirmButtonColor: "#f34e4e",
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description,
    };

    try {
      if (form.id) {
        await updatePermission(form.id, payload);
      } else {
        await createPermission(payload);
      }

      setShowModal(false);
      refreshGrid();
      window.dispatchEvent(new Event("permission-changed"));
    } catch (err) {
      setError(err.message || "Gagal menyimpan permission");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="mb-3">
            <h5 className="card-title">Permission List</h5>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
            <div>
              <a href="#" className="btn btn-primary" onClick={openAddModal}>
                <i className="bx bx-plus me-1"></i> Add New
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div ref={gridRef}></div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <PermissionFormModal
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}