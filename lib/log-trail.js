import { apiFetch, apiFetchRaw } from "@/lib/api";

export function getAuditTrails(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();

  return apiFetchRaw(`/audit-trail${query ? `?${query}` : ""}`);
}

export function getAuditTrail(id) {
  return apiFetch(`/audit-trail/${id}`);
}