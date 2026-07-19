"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import { getRoles, createRole, updateRole, deleteRole, assignPermission, revokePermission } from "@/lib/roles";
import RoleFormModal, { emptyRoleForm } from "@/components/roles/RoleFormModal";
import { formatDateTime } from "@/lib/helper/format-utils";

const columns = [
  { name: "name", width: "150px" },
  { name: "description", width: "150px" },
  { name: "Permissions", width: "180px" },
  { name: "created_at", width: "180px" },
  { name: "Actions", width: "130px" },
];

function formatRow(role) {
  return [
    role.name,
    role.description,
    role.permissions?.length ? role.permissions.map((p) => p.name ?? p).join(", ") : "-",
    formatDateTime(role.created_at),
  ];
}

export default function RolePage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const gridjsRef = useRef(null);
  const rolesRef = useRef([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyRoleForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [originalPermissions, setOriginalPermissions] = useState([]);

  const loadGridData = useCallback(async () => {
    const roles = await getRoles();
    rolesRef.current = roles;

    return roles.map((role) => [
      ...formatRow(role),
      gridjsRef.current.html(
        `<div style="white-space: nowrap;">
              <a
                href="javascript:void(0);"
                class="js-edit-role px-2 text-primary"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Edit"
                data-bs-original-title="Edit"
                data-id="${role.id}">
                <i class="bx bx-pencil font-size-18"></i>
            </a>
              <a
                href="javascript:void(0);"
                class="js-delete-role px-2 text-danger"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Delete"
                data-bs-original-title="Delete"
                data-id="${role.id}">
                <i class="bx bx-trash-alt font-size-18"></i>
            </a>
        </div>`
      ),
    ]);
  }, []);

  const renderGrid = useCallback(async () => {
    const gridjs = await waitForGlobal("gridjs");
    gridjsRef.current = gridjs;

    if (!gridInstance.current) {
      gridInstance.current = new gridjs.Grid({
        columns,
        pagination: true,
        sort: true,
        search: true,
        data: loadGridData,
      }).render(gridRef.current);
    } else {
      gridInstance.current.updateConfig({ data: loadGridData }).forceRender();
    }

    gridInstance.current.on("ready", () => {
      if (window.bootstrap) {
        gridRef.current
          .querySelectorAll('[data-bs-toggle="tooltip"]')
          .forEach((el) => new window.bootstrap.Tooltip(el));
      }
    });
  }, [loadGridData]);

  useEffect(() => {
    renderGrid().catch(() => { });

    const container = gridRef.current;
    const handleClick = (e) => {
      const permissionBtn = e.target.closest(".js-manage-permissions");
      const editBtn = e.target.closest(".js-edit-role");
      const deleteBtn = e.target.closest(".js-delete-role");

      if (permissionBtn) openPermissionModal(Number(permissionBtn.dataset.id));
      if (editBtn) openEditModal(Number(editBtn.dataset.id));
      if (deleteBtn) handleDelete(Number(deleteBtn.dataset.id));
    };
    container?.addEventListener("click", handleClick);

    return () => {
      container?.removeEventListener("click", handleClick);
      gridInstance.current?.destroy?.();
    };
  }, [renderGrid]);

  function openAddModal() {
    setForm(emptyRoleForm);
    setOriginalPermissions([]);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(id) {
    const found = rolesRef.current.find((role) => role.id === id);
    if (!found) return;

    const currentPermissions = (found.permissions ?? []).map((p) => p.name ?? p);

    setForm({
      id: found.id,
      name: found.name,
      description: found.description,
      permissions: currentPermissions,
    });
    setOriginalPermissions(currentPermissions);
    setError(null);
    setShowModal(true);
  }

  function openPermissionModal(id) {
    const found = rolesRef.current.find((role) => role.id === id);
    if (!found) return;

    setSelectedRole(found);
    setShowPermissionModal(true);
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
      await deleteRole(id);
      await Swal.fire({
        title: "Deleted!",
        text: "Role has been deleted.",
        icon: "success",
        confirmButtonColor: "#51d28c",
      });
      await renderGrid();
      window.dispatchEvent(new Event("role-changed"));
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete role.",
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
      let roleId = form.id;

      if (form.id) {
        await updateRole(form.id, payload);
      } else {
        const created = await createRole(payload);
        roleId = created.id ?? created.data?.id;
      }

      const toAssign = form.permissions.filter((p) => !originalPermissions.includes(p));
      const toRevoke = originalPermissions.filter((p) => !form.permissions.includes(p));

      await Promise.all([
        ...toAssign.map((name) => assignPermission(roleId, name)),
        ...toRevoke.map((name) => revokePermission(roleId, name)),
      ]);

      setShowModal(false);
      await renderGrid();
      window.dispatchEvent(new Event("role-changed"));
    } catch (err) {
      setError(err.message || "Gagal menyimpan role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="mb-3">
            <h5 className="card-title">Role List</h5>
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
        <RoleFormModal
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