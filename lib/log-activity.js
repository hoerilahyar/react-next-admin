import { apiFetch, apiFetchRaw } from "@/lib/api";

export function getActivities(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();

  return apiFetchRaw(`/activity-logs${query ? `?${query}` : ""}`);
}

export function getActivity(id) {
  return apiFetch(`/activity-logs/${id}`);
}
