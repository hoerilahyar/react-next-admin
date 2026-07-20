import { apiFetch } from "@/lib/api";

export function getAuths(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();

  return apiFetchRaw(`/audit-auth${query ? `?${query}` : ""}`);
}

export function getAuth(id) {
  return apiFetch(`/audit-auth/${id}`);
}
