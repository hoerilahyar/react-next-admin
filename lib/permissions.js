import { apiFetch } from "@/lib/api";

export function getPermissions() {
  return apiFetch("/permissions");
}