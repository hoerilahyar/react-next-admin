import { apiFetch } from "@/lib/api";

export function getMasterGroups() {
  return apiFetch("/masters");
}

export function getMasterGroup(id) {
  return apiFetch(`/masters/${id}`);
}

export function createMasterGroup(payload) {
  return apiFetch("/masters", { method: "POST", body: payload });
}

export function updateMasterGroup(id, payload) {
  return apiFetch(`/masters/${id}`, { method: "PUT", body: payload });
}

export function deleteMasterGroup(id) {
  return apiFetch(`/masters/${id}`, { method: "DELETE" });
}

export function getMasterItems() {
  return apiFetch("/master-items");
}

export function getMasterItem(id) {
  return apiFetch(`/master-items/${id}`);
}

// Nested route: group id comes from the URL, not the body -- the backend
// ignores/overwrites any group_id sent in the payload.
export function createMasterItem(groupId, payload) {
  return apiFetch(`/masters/${groupId}/items`, { method: "POST", body: payload });
}

export function updateMasterItem(id, payload) {
  return apiFetch(`/master-items/${id}`, { method: "PUT", body: payload });
}

export function deleteMasterItem(id) {
  return apiFetch(`/master-items/${id}`, { method: "DELETE" });
}