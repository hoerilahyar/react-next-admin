import { apiFetch } from "@/lib/api";

export function getRoles() {
  return apiFetch("/roles");
}

export function getRole(id) {
  return apiFetch(`/roles/${id}`);
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

export function assignPermission(id, permissionName) {
  return apiFetch(`/roles/${id}/permission`, {
    method: "POST",
    body: { permission: permissionName },
  });
}

export function revokePermission(id, permissionName) {
  return apiFetch(`/roles/${id}/permissions/${permissionName}`, { method: "DELETE" });
}