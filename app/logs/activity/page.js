"use client";

import { useEffect, useRef, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import { getActivities } from "@/lib/log-activity";
import { formatDateTime } from "@/lib/helper/format-utils";

const columns = [
  { name: "user_id", width: "100px" },
  { name: "activity", width: "150px" },
  { name: "module", width: "150px" },
  { name: "resource_type", width: "150px" },
  { name: "resource_id", width: "150px" },
  { name: "method", width: "150px" },
  { name: "path", width: "150px" },
  { name: "description", width: "100px" },
  { name: "ip_address", width: "100px" },
  { name: "user_agent", width: "300px" },
  { name: "status_code", width: "100px" },
  { name: "trace_id", width: "150px" },
  { name: "created_at", width: "120px" },
];

function formatRow(log_activity) {
  return [
    log_activity.user_id,
    log_activity.activity,
    log_activity.module,
    log_activity.resource_type,
    log_activity.resource_id,
    log_activity.method,
    log_activity.path,
    log_activity.description,
    log_activity.ip_address,
    log_activity.user_agent,
    log_activity.status_code,
    log_activity.trace_id,
    formatDateTime(log_activity.created_at),
  ];
}

export default function LogActivityPage() {
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
            url.searchParams.set("page", page + 1);
            url.searchParams.set("limit", limit);
            return url.toString();
          },
        },
      },
      server: {
        url: "/activity",
        data: async (opts) => {
          const relativeUrl = opts.url.replace(
            window.location.origin,
            ""
          );
          const query = relativeUrl.split("?")[1] ?? "";

          const res = await getActivities(
            Object.fromEntries(new URLSearchParams(query))
          );

          return {
            data: res.data.map((activity) => [
              ...formatRow(activity),
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
            <h5 className="card-title">Activity Log</h5>
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