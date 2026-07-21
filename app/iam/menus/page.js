"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import { getMenus, createMenu, updateMenu, deleteMenu, syncMenuPermissions } from "@/lib/menus";
import { getPermissions } from "@/lib/permissions";
import MenuFormModal, { emptyMenuForm } from "@/components/menus/MenuFormModal";

const columns = [
  { name: "Name", width: "200px" },
  { name: "Slug", width: "140px" },
  { name: "Path", width: "160px" },
  { name: "Icon", width: "90px" },
  { name: "Order", width: "95px" },
  { name: "Status", width: "100px" },
  { name: "Permissions", width: "180px" },
  { name: "Actions", width: "100px" },
];

function flattenMenus(menus, depth = 0, acc = []) {
  menus.forEach((menu) => {
    acc.push({ menu, depth });
    if (menu.children?.length) flattenMenus(menu.children, depth + 1, acc);
  });
  return acc;
}

function collectSubtreeIds(menu, acc = []) {
  acc.push(menu.id);
  menu.children?.forEach((child) => collectSubtreeIds(child, acc));
  return acc;
}

function formatRow(menu, depth) {
  const indent = depth > 0 ? "— ".repeat(depth) : "";
  return [
    `${indent}${menu.name}`,
    menu.slug,
    menu.path,
    menu.icon ?? "-",
    menu.order_index,
    menu.is_active ? "Active" : "Inactive",
    menu.permissions?.length ? menu.permissions.join(", ") : "-",
  ];
}

export default function MenusPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const gridjsRef = useRef(null);
  const flatMenusRef = useRef([]); // array of { menu, depth }

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyMenuForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [permissionOptions, setPermissionOptions] = useState([]);
  const permissionOptionsRef = useRef([]);
  const [excludedParentIds, setExcludedParentIds] = useState([]);

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
        url: "/menus",
        data: async (opts) => {
          const relativeUrl = opts.url.replace(window.location.origin, "");
          const query = relativeUrl.split("?")[1] ?? "";

          const res = await getMenus(
            Object.fromEntries(new URLSearchParams(query))
          );

          // Backend always returns the full nested tree, ignoring
          // search/page/limit params, so we flatten it client-side here.
          const flattened = flattenMenus(res.data);
          flatMenusRef.current = flattened;

          return {
            data: flattened.map(({ menu, depth }) => [
              ...formatRow(menu, depth),
              gridjsRef.current.html(
                `<div style="white-space: nowrap;">
                      <a
                          href="javascript:void(0);"
                          class="js-view-menu px-2 text-primary"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          aria-label="View"
                          data-bs-original-title="View"
                          data-id="${menu.id}">
                          <i class="bx bxs-user-detail font-size-18"></i>
                      </a>
                      <a
                          href="javascript:void(0);"
                          class="js-edit-menu px-2 text-primary"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          aria-label="Edit"
                          data-bs-original-title="Edit"
                          data-id="${menu.id}">
                          <i class="bx bx-pencil font-size-18"></i>
                      </a>
                      <a
                          href="javascript:void(0);"
                          class="js-delete-menu px-2 text-danger"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          aria-label="Delete"
                          data-bs-original-title="Delete"
                          data-id="${menu.id}">
                          <i class="bx bx-trash-alt font-size-18"></i>
                      </a>
                  </div>`
              ),
            ]),
            // Backend doesn't actually paginate, so total = full flattened count.
            total: flattened.length,
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
      const editBtn = e.target.closest(".js-edit-menu");
      const deleteBtn = e.target.closest(".js-delete-menu");
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

  useEffect(() => {
    (async () => {
      try {
        const perms = await getPermissions();
        const list = Array.isArray(perms) ? perms : (perms?.data ?? []);
        setPermissionOptions(list);
        permissionOptionsRef.current = list;
      } catch {
        setPermissionOptions([]);
        permissionOptionsRef.current = [];
      }
    })();
  }, []);

  function openAddModal() {
    setForm(emptyMenuForm);
    setExcludedParentIds([]);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(id) {
    const found = flatMenusRef.current.find(({ menu }) => menu.id === id)?.menu;
    if (!found) return;

    const permList = Array.isArray(permissionOptionsRef.current)
      ? permissionOptionsRef.current
      : (permissionOptionsRef.current?.data ?? []);

    const currentPermissionIds = (found.permissions ?? [])
      .map((name) => permList.find((perm) => perm.name === name)?.id)
      .filter((permId) => permId !== undefined);

    setForm({
      id: found.id,
      parent_id: found.parent_id,
      name: found.name,
      slug: found.slug,
      path: found.path,
      icon: found.icon ?? "",
      order_index: found.order_index,
      is_active: found.is_active,
      permissions: currentPermissionIds,
    });
    setExcludedParentIds(collectSubtreeIds(found));
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
      await deleteMenu(id);
      await Swal.fire({
        title: "Deleted!",
        text: "Menu has been deleted.",
        icon: "success",
        confirmButtonColor: "#51d28c",
      });
      refreshGrid();
      window.dispatchEvent(new Event("menu-changed"));
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete menu.",
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
      parent_id: form.parent_id,
      name: form.name,
      slug: form.slug,
      path: form.path,
      icon: form.icon || null,
      order_index: Number(form.order_index),
      is_active: form.is_active,
    };

    try {
      let menuId = form.id;

      if (menuId) {
        await updateMenu(menuId, payload);
      } else {
        const created = await createMenu(payload);
        menuId = created.id ?? created.data?.id;
      }

      await syncMenuPermissions(menuId, form.permissions);

      setShowModal(false);
      refreshGrid();
      window.dispatchEvent(new Event("menu-changed"));
    } catch (err) {
      setError(err.message || "Gagal menyimpan menu");
    } finally {
      setSaving(false);
    }
  }

  const availableParentOptions = flatMenusRef.current.filter(
    ({ menu }) => !excludedParentIds.includes(menu.id)
  );

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="mb-3">
            <h5 className="card-title">Menu List </h5>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
            <div>
              <a href="#" className="btn btn-primary" onClick={openAddModal}><i className="bx bx-plus me-1"></i> Add New</a>
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
        <MenuFormModal
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          saving={saving}
          error={error}
          parentOptions={availableParentOptions}
          permissionOptions={permissionOptions}
        />
      )}
    </div>
  );
}