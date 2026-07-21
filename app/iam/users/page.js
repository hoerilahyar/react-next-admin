"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import {
  getUsers,
  getUserProfile,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  revokeRole,
} from "@/lib/users";
import { getRoles } from "@/lib/roles";
import UserFormModal, { emptyUserForm } from "@/components/users/UserFormModal";
import UserViewModal from "@/components/users/UserViewModal";
import { formatDateTime } from "@/lib/helper/format-utils";

const columns = [
  { name: "name", width: "150px" },
  { name: "username", width: "150px" },
  { name: "email", width: "150px" },
  { name: "Roles", width: "160px" },
  { name: "is_active", width: "95px" },
  { name: "last_login_at", width: "180px" },
  { name: "created_at", width: "180px" },
  { name: "Actions", width: "100px" },
];

function formatRow(user) {
  return [
    user.name,
    user.username,
    user.email,
    user.roles?.length ? user.roles.map((r) => r.name ?? r).join(", ") : "-",
    user.is_active ? "Active" : "Inactive",
    formatDateTime(user.last_login_at),
    formatDateTime(user.created_at),
  ];
}

export default function UserPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const gridjsRef = useRef(null);
  const usersRef = useRef([]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);
  const [form, setForm] = useState(emptyUserForm);
  const [originalRoles, setOriginalRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Role options for the checkbox list, fetched once at page level
  // (same pattern as permissionOptions in MenusPage) instead of
  // re-fetching every time the modal opens.
  const [roleOptions, setRoleOptions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(null);
  const roleOptionsRef = useRef([]);

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
        url: "/users",
        data: async (opts) => {
          const relativeUrl = opts.url.replace(window.location.origin, "");
          const query = relativeUrl.split("?")[1] ?? "";

          const res = await getUsers(
            Object.fromEntries(new URLSearchParams(query))
          );

          usersRef.current = res.data;

          return {
            data: res.data.map((user) => [
              ...formatRow(user),
              gridjsRef.current.html(
                `<div style="white-space: nowrap;">
                    <a
                        href="javascript:void(0);"
                        class="js-view-user px-2 text-primary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        aria-label="View"
                        data-bs-original-title="View"
                        data-id="${user.id}">
                        <i class="bx bxs-user-detail font-size-18"></i>
                    </a>
                    <a
                        href="javascript:void(0);"
                        class="js-edit-user px-2 text-primary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        aria-label="Edit"
                        data-bs-original-title="Edit"
                        data-id="${user.id}">
                        <i class="bx bx-pencil font-size-18"></i>
                    </a>
                    <a
                        href="javascript:void(0);"
                        class="js-delete-user px-2 text-danger"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        aria-label="Delete"
                        data-bs-original-title="Delete"
                        data-id="${user.id}">
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
      const viewBtn = e.target.closest(".js-view-user");
      const editBtn = e.target.closest(".js-edit-user");
      const deleteBtn = e.target.closest(".js-delete-user");

      if (viewBtn) openViewModal(Number(viewBtn.dataset.id));
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

  // Fetch role options once when the page mounts.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingRoles(true);
      setRolesError(null);
      try {
        const res = await getRoles();
        // Defensive unwrap: API may return either a bare array or
        // an envelope like { success, data, meta }.
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (!cancelled) {
          setRoleOptions(list);
          roleOptionsRef.current = list;
        }
      } catch (err) {
        if (!cancelled) setRolesError(err.message || "Gagal memuat roles.");
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function openAddModal() {
    setForm(emptyUserForm);
    setOriginalRoles([]);
    setError(null);
    setShowModal(true);
  }

  async function openViewModal(id) {
    const basic = usersRef.current.find((user) => user.id === id);
    if (!basic) return;

    setShowViewModal(true);
    setSelectedUser({ ...basic, profile: null });
    setViewError(null);
    setViewLoading(true);

    try {
      const profile = await getUserProfile(id);
      setSelectedUser({ ...basic, profile });
    } catch (err) {
      setViewError(err.message || "Gagal memuat detail user.");
    } finally {
      setViewLoading(false);
    }
  }

  function openEditModal(id) {
    const found = usersRef.current.find((user) => user.id === id);
    if (!found) return;

    const currentRoles = (found.roles ?? []).map((r) => r.name ?? r);

    setForm({
      id: found.id,
      name: found.name,
      username: found.username,
      email: found.email,
      password: "",
      is_active: found.is_active,
      roles: currentRoles,
    });
    setOriginalRoles(currentRoles);
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
      await deleteUser(id);
      await Swal.fire({
        title: "Deleted!",
        text: "User has been deleted.",
        icon: "success",
        confirmButtonColor: "#51d28c",
      });
      refreshGrid();
      window.dispatchEvent(new Event("user-changed"));
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete user.",
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
      username: form.username,
      email: form.email,
      is_active: form.is_active,
    };

    if (form.password) {
      payload.password = form.password;
    }

    try {
      let userId = form.id;

      if (form.id) {
        await updateUser(form.id, payload);
      } else {
        const created = await createUser(payload);
        userId = created.id ?? created.data?.id;
      }

      const toAssign = form.roles.filter((r) => !originalRoles.includes(r));
      const toRevoke = originalRoles.filter((r) => !form.roles.includes(r));

      for (const name of toAssign) {
        await assignRole(userId, name);
      }
      for (const name of toRevoke) {
        await revokeRole(userId, name);
      }

      setShowModal(false);
      refreshGrid();
      window.dispatchEvent(new Event("user-changed"));
    } catch (err) {
      setError(err.message || "Gagal menyimpan user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="mb-3">
            <h5 className="card-title">User List</h5>
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
        <UserFormModal
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          saving={saving}
          error={error}
          roleOptions={roleOptions}
          loadingRoles={loadingRoles}
          rolesError={rolesError}
        />
      )}
      {showViewModal && (
        <UserViewModal
          user={selectedUser}
          loading={viewLoading}
          error={viewError}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
}