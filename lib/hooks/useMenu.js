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
      const data = await apiFetch("/me/menu");

      setMenu(
        Array.isArray(data)
          ? data
          : data?.menu ?? []
      );
    } catch (err) {
      setError(err.message || "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();

    const handleMenuChanged = () => {
      fetchMenu();
    };

    window.addEventListener(
      "menu-changed",
      handleMenuChanged
    );

    return () => {
      window.removeEventListener(
        "menu-changed",
        handleMenuChanged
      );
    };
  }, [fetchMenu]);

  return {
    menu,
    loading,
    error,
    refetch: fetchMenu,
  };
}