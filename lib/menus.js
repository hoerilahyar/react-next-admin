import { apiFetch } from "@/lib/api";

export function getMenus() {
  return apiFetch("/menus");
}

export function createMenu(payload) {
  return apiFetch("/menus", { method: "POST", body: payload });
}

export function updateMenu(id, payload) {
  return apiFetch(`/menus/${id}`, { method: "PUT", body: payload });
}

export function deleteMenu(id) {
  return apiFetch(`/menus/${id}`, { method: "DELETE" });
}

export function addMenuPermission(menuId, permission) {
  return apiFetch(`/menus/${menuId}/permission`, {
    method: "POST",
    body: { permission },
  });
}

export function removeMenuPermission(menuId, permission) {
  return apiFetch(`/menus/${menuId}/permission/${permission}`, {
    method: "DELETE",
  });
}

// Reconciles the permission list on the server with the desired list
// by diffing against what the menu had before, then firing the
// add/remove calls needed to close the gap.
export async function syncMenuPermissions(menuId, previousPermissions, nextPermissions) {
  const prev = new Set(previousPermissions ?? []);
  const next = new Set(nextPermissions ?? []);

  const toAdd = [...next].filter((p) => !prev.has(p));
  const toRemove = [...prev].filter((p) => !next.has(p));

  await Promise.all([
    ...toAdd.map((p) => addMenuPermission(menuId, p)),
    ...toRemove.map((p) => removeMenuPermission(menuId, p)),
  ]);
}