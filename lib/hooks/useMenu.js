"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function useMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/me/menu"); // auth: true (default) -> otomatis pakai access_token + auto-refresh
      setMenu(Array.isArray(data) ? data : data?.menu ?? []);
    } catch (err) {
      setError(err.message || "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { menu, loading, error, refetch: fetchMenu };
}