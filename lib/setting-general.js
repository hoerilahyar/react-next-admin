import { apiFetch } from "@/lib/api";

export function getSettings() {
  return apiFetch("/settings");
}

export function getSetting(id) {
  return apiFetch(`/settings/${id}`);
}

export function upsertSetting(payload, key) {
  return apiFetch(`/settings/${key}`, { method: "PUT", body: payload });
}

export function deleteSetting(key) {
  return apiFetch(`/settings/${key}`, { method: "DELETE" });
}