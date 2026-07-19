import { apiFetch } from "@/lib/api";

export function getUsers() {
  return apiFetch("/users");
}

export function getUser(id) {
  return apiFetch(`/users/${id}`);
}

export function getUserProfile(id) {
  return apiFetch(`/users/${id}/profile`);
}

export function createUser(payload) {
  return apiFetch("/users", { method: "POST", body: payload });
}

export function updateUser(id, payload) {
  return apiFetch(`/users/${id}`, { method: "PUT", body: payload });
}

export function deleteUser(id) {
  return apiFetch(`/users/${id}`, { method: "DELETE" });
}
