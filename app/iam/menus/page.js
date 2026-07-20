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
  const flatMenusRef = useRef([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyMenuForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [permissionOptions, setPermissionOptions] = useState([]);
  // Same fix as RolePage: the click listener below is attached once on
  // mount, so reading permissionOptions (state) inside openEditModal would
  // always see the stale, empty value from that first render. This ref
  // stays in sync and is read fresh every call.
  const permissionOptionsRef = useRef([]);
  const [excludedParentIds, setExcludedParentIds] = useState([]);

  useEffect(() => {
    getPermissions()
      .then((perms) => {
        setPermissionOptions(perms);
        permissionOptionsRef.current = perms;
      })
      .catch(() => setPermissionOptions([]));
  }, []);

  const loadGridData = useCallback(async () => {
    const menus = await getMenus();
    const flat = flattenMenus(menus);
    flatMenusRef.current = flat;

    return flat.map(({ menu, depth }) => [
      ...formatRow(menu, depth),
      gridjsRef.current.html(
        `<div style="white-space: nowrap;">
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
    let cancelled = false;
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
      cancelled = true;
      container?.removeEventListener("click", handleClick);
      if (cancelled) gridInstance.current?.destroy?.();
    };
  }, [renderGrid]);

  function openAddModal() {
    setForm(emptyMenuForm);
    setExcludedParentIds([]);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(id) {
    const found = flatMenusRef.current.find(({ menu }) => menu.id === id)?.menu;
    if (!found) return;

    const currentPermissionIds = (found.permissions ?? [])
      .map((name) => permissionOptionsRef.current.find((perm) => perm.name === name)?.id)
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
      await renderGrid();
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
      await renderGrid();
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