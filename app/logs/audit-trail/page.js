"use client";

import { useEffect, useRef, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import { getAuditTrails } from "@/lib/log-trail";
import { formatDateTime } from "@/lib/helper/format-utils";

const columns = [
  { name: "User ID", width: "100px" },
  { name: "Action", width: "120px" },
  { name: "Entity Type", width: "120px" },
  { name: "Entity ID", width: "120px" },
  { name: "Old Values", width: "300px" },
  { name: "New Values", width: "300px" },
  { name: "IP Address", width: "100px" },
  { name: "User Agent", width: "200px" },
  { name: "Description", width: "100px" },
  { name: "created_at", width: "120px" },
];

function formatJsonValue(value, maxLength = 80) {
  if (value === null || value === undefined) return "-";

  let str;
  try {
    str = JSON.stringify(value);
  } catch {
    str = String(value);
  }

  if (str.length > maxLength) {
    str = str.slice(0, maxLength) + "...";
  }
  return str;
}

function formatRow(audit_trail, gridjs) {
  return [
    audit_trail.user_id,
    audit_trail.action,
    audit_trail.entity_type,
    audit_trail.entity_id,
    gridjs.html(
      `<span title="${escapeHtml(JSON.stringify(audit_trail.old_values))}" style="cursor:help;">
        ${escapeHtml(formatJsonValue(audit_trail.old_values))}
      </span>`
    ),
    gridjs.html(
      `<span title="${escapeHtml(JSON.stringify(audit_trail.new_values))}" style="cursor:help;">
        ${escapeHtml(formatJsonValue(audit_trail.new_values))}
      </span>`
    ),
    audit_trail.ip_address,
    audit_trail.user_agent,
    audit_trail.description,
    formatDateTime(audit_trail.created_at),
  ];
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function LogAuditTrailPage() {
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
            const url = new URL(prev, window.location.origin);
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
            const url = new URL(prev, window.location.origin);
            url.searchParams.set("page", page + 1); // grid.js page 0-based
            url.searchParams.set("limit", limit);
            return url.toString();
          },
        },
      },
      server: {
        url: "/audit-trail",
        data: async (opts) => {
          const relativeUrl = opts.url.replace(window.location.origin, "");
          const query = relativeUrl.split("?")[1] ?? "";
          const res = await getAuditTrails(Object.fromEntries(new URLSearchParams(query)));

          return {
            data: res.data.map((audit_trail) => [
              ...formatRow(audit_trail, gridjsRef.current),
            ]),
            total: res.meta.total,
          };
        },
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
            <h5 className="card-title">Audit Trail Log</h5>
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