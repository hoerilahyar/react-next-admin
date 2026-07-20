"use client";

import { useEffect, useRef, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import { getAccessToken, SESSION_EXPIRED_EVENT } from "@/lib/api"; // ⚠️ sesuaikan path token helper kamu
import { formatDateTime } from "@/lib/helper/format-utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const columns = [
  { name: "User ID", width: "100px" },
  { name: "Email Attempted", width: "150px" },
  { name: "IP Address", width: "150px" },
  { name: "User Agent", width: "250px" },
  { name: "Status", width: "150px" },
  { name: "Created At", width: "120px" },
];

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function LogAuthPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const gridjsRef = useRef(null);

  const renderGrid = useCallback(async () => {
    const gridjs = await waitForGlobal("gridjs");
    gridjsRef.current = gridjs;

    if (gridInstance.current) return;

    gridInstance.current = new gridjs.Grid({
      columns: [...columns],
      sort: false,
      search: {
        server: {
          url: (prev, keyword) => {
            const url = new URL(prev);
            if (keyword) url.searchParams.set("search", keyword);
            else url.searchParams.delete("search");
            return url.toString();
          },
        },
      },
      pagination: {
        limit: 20,
        server: {
          url: (prev, page, limit) => {
            const url = new URL(prev);
            url.searchParams.set("page", page + 1); // grid.js page 0-based
            url.searchParams.set("limit", limit);
            return url.toString();
          },
        },
      },
      server: {
        url: `${API_BASE}/audit-auth`,
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        handle: async (res) => {
          if (res.status === 401) {
            window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
            window.location.href = "/login";
            throw new Error("Sesi berakhir, silakan login kembali");
          }
          if (!res.ok) throw new Error(`Request gagal (${res.status})`);
          return res.json();
        },
        then: (res) =>
          res.data.map((log_auth) => [
            log_auth.user_id,
            log_auth.email_attempted,
            log_auth.ip_address,
            log_auth.user_agent,
            log_auth.status,
            formatDateTime(log_auth.created_at),
          ]),
        total: (res) => res.meta.total,
      },
    }).render(gridRef.current);

    gridInstance.current.on("ready", () => {
      if (window.bootstrap) {
        gridRef.current
          .querySelectorAll('[data-bs-toggle="tooltip"]')
          .forEach((el) => new window.bootstrap.Tooltip(el));
      }
    });
  }, []);

  useEffect(() => {
    renderGrid().catch(() => { });
    return () => {
      gridInstance.current?.destroy?.();
      gridInstance.current = null;
    };
  }, [renderGrid]);

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="mb-3">
            <h5 className="card-title">Auth Log</h5>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div ref={gridRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}