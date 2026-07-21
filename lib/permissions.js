import { apiFetch, apiFetchRaw } from "@/lib/api";

export function getPermissions(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();

  return apiFetchRaw(`/permissions${query ? `?${query}` : ""}`);
}

export function gePermissions() {
  return apiFetch("/permissions");
}

export function getPermission(id) {
  return apiFetch(`/permissions/${id}`);
}

export function createPermission(payload) {
  return apiFetch("/permissions", { method: "POST", body: payload });
}

export function updatePermission(id, payload) {
  return apiFetch(`/permissions/${id}`, { method: "PUT", body: payload });
}

export function deletePermission(id) {
  return apiFetch(`/permissions/${id}`, { method: "DELETE" });
}
