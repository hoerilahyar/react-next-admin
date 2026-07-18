"use client";

import { useEffect, useRef } from "react";
import { waitForGlobal } from "@/lib/chart-utils";

const categories = [
  { label: "Men Fashion", percent: "34.3%", dotClass: "text-primary" },
  { label: "Women Clothing", percent: "25.7%", dotClass: "text-success" },
  { label: "Beauty Products", percent: "18.6%", dotClass: "text-info" },
  { label: "Others Products", percent: "21.4%", dotClass: "text-secondary" },
];

export default function TopSellingCategories() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    let cancelled = false;

    waitForGlobal("ApexCharts")
      .then((ApexCharts) => {
        if (cancelled || !chartRef.current) return;

        const options = {
          chart: { height: 350, type: "donut" },
          series: [24, 18, 13, 15],
          labels: ["Fashion", "Beauty", "Clothing", "Others"],
          colors: ["#1f58c7", "#4976cf", "#6a92e1", "#e6ecf9"],
          plotOptions: {
            pie: {
              startAngle: 25,
              donut: {
                size: "72%",
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: "Products",
                    fontSize: "22px",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                  },
                },
              },
            },
          },
          legend: { show: false },
          dataLabels: {
            style: { fontSize: "11px", fontFamily: "Montserrat, sans-serif", fontWeight: "bold" },
            background: {
              enabled: true,
              foreColor: "#fff",
              padding: 4,
              borderRadius: 2,
              borderWidth: 1,
              borderColor: "#fff",
              opacity: 1,
            },
          },
          responsive: [{ breakpoint: 600, options: { chart: { height: 240 }, legend: { show: false } } }],
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
    <div className="col-xxl-4">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-start">
            <div className="flex-grow-1 overflow-hidden">
              <h5 className="card-title mb-4 text-truncate">Top Selling Categories</h5>
            </div>
            <div className="flex-shrink-0 ms-2">
              <div className="dropdown">
                <a
                  className="dropdown-toggle text-reset"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="fw-semibold">Sort By:</span>{" "}
                  <span className="text-muted">Weekly<i className="mdi mdi-chevron-down ms-1"></i></span>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" href="#">Yearly</a>
                  <a className="dropdown-item" href="#">Monthly</a>
                  <a className="dropdown-item" href="#">Weekly</a>
                </div>
              </div>
            </div>
          </div>

          <div ref={chartRef} dir="ltr"></div>

          <div className="row mt-3 pt-1">
            {categories.map((cat, i) => (
              <div className="col-md-6" key={cat.label}>
                <div className="px-2 mt-2">
                  <div className={`d-flex align-items-center ${i === 0 ? "mt-sm-0" : ""} mt-2`}>
                    <i className={`mdi mdi-circle font-size-10 ${cat.dotClass}`}></i>
                    <div className="flex-grow-1 ms-2 overflow-hidden">
                      <p className="font-size-15 mb-0 text-truncate">{cat.label}</p>
                    </div>
                    <div className="flex-shrink-0 ms-2">
                      <span className="fw-bold">{cat.percent}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
