"use client";

import { useEffect, useRef } from "react";
import { waitForGlobal } from "@/lib/chart-utils";

export default function OverviewChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    let cancelled = false;

    waitForGlobal("ApexCharts")
      .then((ApexCharts) => {
        if (cancelled || !chartRef.current) return;

        const options = {
          series: [{ data: [4, 6, 10, 17, 15, 19, 23, 27, 29, 25, 32, 35] }],
          chart: {
            toolbar: { show: false },
            height: 323,
            type: "bar",
          },
          plotOptions: {
            bar: {
              columnWidth: "80%",
              distributed: true,
              horizontal: false,
              borderRadius: 8,
            },
          },
          fill: { opacity: 1 },
          stroke: { show: false },
          dataLabels: { enabled: false },
          legend: { show: false },
          colors: [
            "#e6ecf9", "#e6ecf9", "#e6ecf9", "#e6ecf9", "#e6ecf9", "#e6ecf9",
            "#e6ecf9", "#e6ecf9", "#e6ecf9", "#1f58c7", "#1f58c7", "#1f58c7",
          ],
          xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          },
        };

        chartInstance.current = new ApexCharts(chartRef.current, options);
        chartInstance.current.render();
      })
      .catch(() => { });

    return () => {
      cancelled = true;
      chartInstance.current?.destroy();
    };
  }, []);

  return (
    <div className="col-xl-6">
      <div className="card">
        <div className="card-body pb-0">
          <div className="d-flex align-items-start">
            <div className="flex-grow-1">
              <h5 className="card-title mb-4">Overview</h5>
            </div>
            <div className="flex-shrink-0">
              <div className="dropdown">
                <a
                  className="dropdown-toggle text-reset"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="fw-semibold">Sort By:</span>{" "}
                  <span className="text-muted">Yearly<i className="mdi mdi-chevron-down ms-1"></i></span>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" href="#">Yearly</a>
                  <a className="dropdown-item" href="#">Monthly</a>
                  <a className="dropdown-item" href="#">Weekly</a>
                  <a className="dropdown-item" href="#">Today</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div ref={chartRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
