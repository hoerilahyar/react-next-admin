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

// Replaces the menu's full permission set in one call. `permissionIds` is
// the complete desired list (ids), not a diff -- the server reconciles it
// against what's currently assigned.
export function syncMenuPermissions(menuId, permissionIds) {
  return apiFetch(`/menus/${menuId}/permissions`, {
    method: "PUT",
    body: { permission_ids: permissionIds },
  });
}