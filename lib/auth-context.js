"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiFetch,
  saveSession,
  saveUser,
  clearSession,
  getAccessToken,
  getRefreshToken,
  scheduleProactiveRefresh,
  SESSION_REFRESHED_EVENT,
  SESSION_EXPIRED_EVENT,
} from "@/lib/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "auth_user";

const ME_POLL_INTERVAL_MS = 5 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      scheduleProactiveRefresh();

      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch (err) {
        console.error("Gagal membaca session lokal:", err);
      }

      try {
        const freshUser = await apiFetch("/me");
        if (isMounted) {
          saveUser(freshUser);
          setUser(freshUser);
        }
      } catch (err) {
        console.error("Validasi session gagal:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleSessionRefreshed(e) {
      setUser(e.detail);
    }

    function handleSessionExpired() {
      setUser(null);
    }

    window.addEventListener(SESSION_REFRESHED_EVENT, handleSessionRefreshed);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_REFRESHED_EVENT, handleSessionRefreshed);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (!user || !ME_POLL_INTERVAL_MS) return;

    const interval = setInterval(async () => {
      try {
        const freshUser = await apiFetch("/me");
        saveUser(freshUser);
        setUser(freshUser);
      } catch (err) {
        console.error("Polling /me gagal:", err);
      }
    }, ME_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user]);

  async function login({ identifier, password }) {
    if (!identifier || !password) {
      throw new Error("Email dan password wajib diisi");
    }

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: { identifier, password },
      auth: false,
    });

    saveSession(data);
    setUser(data.user);
    router.push("/dashboard");
    return data.user;
  }

  async function register({ name, identifier, password }) {
    if (!name || !identifier || !password) {
      throw new Error("Semua field wajib diisi");
    }

    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: { name, identifier, password },
      auth: false,
    });

    saveSession(data);
    setUser(data.user);
    router.push("/dashboard");
    return data.user;
  }

  async function logout() {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: { refresh_token: refreshToken },
        });
      } catch (err) {
        console.error("Logout di server gagal, tetap hapus session lokal:", err);
      }
    }

    clearSession();
    setUser(null);
    router.push("/login");
  }

  // Role(s) yang dianggap superadmin: selalu lolos pengecekan permission apa pun.
  // Sesuaikan nama role di sini dengan role admin di database kamu.
  const SUPER_ROLES = ["Admin", "Super Admin", "Superadmin"];

  function hasPermission(permission) {
    if (!permission) return true; // halaman tanpa permission spesifik, cukup login
    if (!user) return false;

    if (user.roles?.some((role) => SUPER_ROLES.includes(role))) {
      return true;
    }

    // `user.permissions` adalah array string, mis: ["permissions.view", "users.manage"]
    // Field ini yang akan kamu tambahkan di response API /me.
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  }

  function hasAnyPermission(permissions = []) {
    if (!permissions.length) return true;
    return permissions.some((p) => hasPermission(p));
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, hasPermission, hasAnyPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
