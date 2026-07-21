import { apiFetch, apiFetchRaw } from "@/lib/api";

export function getRoles(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();

  return apiFetchRaw(`/roles${query ? `?${query}` : ""}`);
}

export function createRole(payload) {
  return apiFetch("/roles", { method: "POST", body: payload });
}

export function updateRole(id, payload) {
  return apiFetch(`/roles/${id}`, { method: "PUT", body: payload });
}

export function deleteRole(id) {
  return apiFetch(`/roles/${id}`, { method: "DELETE" });
}

// Replaces the role's full permission set in one call. `permissionIds` is
// the complete desired list (ids), not a diff -- the server reconciles it
// against what's currently assigned.
export function syncRolePermissions(roleId, permissionIds) {
  return apiFetch(`/roles/${roleId}/permissions`, {
    method: "PUT",
    body: { permission_ids: permissionIds },
  });
}