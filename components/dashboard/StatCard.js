"use client";

import { useEffect, useRef } from "react";
import { waitForGlobal } from "@/lib/chart-utils";

/**
 * Mini stat card with an icon, a value + trend, and a small sparkline chart.
 *
 * @param {string} icon - boxicons class, e.g. "bx bx-check-shield"
 * @param {string} title - card title, e.g. "Total Sales"
 * @param {string} value - main value, e.g. "$34,123.20"
 * @param {string} change - trend text, e.g. "8.34%"
 * @param {"up"|"down"} trend
 * @param {string} subtitle - small caption under the value
 * @param {number[]} data - sparkline series data
 */
export default function StatCard({ icon, title, value, change, trend, subtitle, data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    let cancelled = false;

    waitForGlobal("ApexCharts")
      .then((ApexCharts) => {
        if (cancelled || !chartRef.current) return;

        const options = {
          series: [{ data }],
          chart: {
            type: "area",
            width: 110,
            height: 35,
            sparkline: { enabled: true },
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.45,
              opacityTo: 0.05,
              stops: [20, 100, 100, 100],
            },
          },
          stroke: { curve: "smooth", width: 2 },
          colors: ["#1f58c7"],
          tooltip: {
            fixed: { enabled: false },
            x: { show: false },
            y: { title: { formatter: () => "" } },
            marker: { show: false },
          },
        };

        chartInstance.current = new ApexCharts(chartRef.current, options);
        chartInstance.current.render();
      })
      .catch(() => {
        // ApexCharts didn't load in time; the card still renders fine without the sparkline.
      });

    return () => {
      cancelled = true;
      chartInstance.current?.destroy();
    };
  }, [data]);

  const trendClass = trend === "down" ? "text-danger" : "text-success";
  const trendIcon = trend === "down" ? "mdi mdi-arrow-down" : "mdi mdi-arrow-up";

  return (
    <div className="col-xl-6">
      <div className="card">
        <div className="card-body">
          <div>
            <div className="d-flex align-items-center">
              <div className="avatar">
                <div className="avatar-title rounded bg-primary-subtle">
                  <i className={`${icon} font-size-24 mb-0 text-primary`}></i>
                </div>
              </div>

              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0 font-size-15">{title}</h6>
              </div>

              <div className="flex-shrink-0">
                <div className="dropdown">
                  <a
                    className="dropdown-toggle"
                    href="#"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i className="bx bx-dots-horizontal text-muted font-size-22"></i>
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
              <h4 className="mt-4 pt-1 mb-0 font-size-22">
                {value}{" "}
                <span className={`${trendClass} fw-medium font-size-13 align-middle`}>
                  <i className={trendIcon}></i> {change}
                </span>
              </h4>
              <div className="d-flex mt-1 align-items-end overflow-hidden">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0 text-truncate">{subtitle}</p>
                </div>
                <div className="flex-shrink-0">
                  <div ref={chartRef}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
