"use client";

import { useEffect, useRef } from "react";
import { waitForGlobal, waitForCondition } from "@/lib/chart-utils";

const countries = [
  { flag: "/assets/images/flags/us.jpg", name: "United States", orders: "46k", earnings: "$6,524.30" },
  { flag: "/assets/images/flags/italy.jpg", name: "Italy", orders: "86k", earnings: "$6,985.94" },
  { flag: "/assets/images/flags/spain.jpg", name: "Spain", orders: "86k", earnings: "$5,685.47" },
  { flag: "/assets/images/flags/french.jpg", name: "French", orders: "56k", earnings: "$5,645.45" },
];

export default function SalesRevenueMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    let cancelled = false;

    waitForGlobal("jsVectorMap")
      .then(async (jsVectorMap) => {
        await waitForCondition(() => !!jsVectorMap.maps?.world_merc);
        if (cancelled || !mapRef.current) return;

        mapInstance.current = new jsVectorMap({
          map: "world_merc",
          selector: mapRef.current,
          zoomOnScroll: false,
          zoomButtons: false,
          selectedMarkers: [0, 2],
          markersSelectable: true,
          regionStyle: { initial: { fill: "#cfd9ed" } },
          markers: [
            { name: "United States", coords: [31.9474, 35.2272] },
            { name: "Italy", coords: [61.524, 105.3188] },
            { name: "French", coords: [56.1304, -106.3468] },
            { name: "Spain", coords: [71.7069, -42.6043] },
          ],
          markerStyle: {
            initial: { fill: "#1f58c7" },
            selected: { fill: "#1f58c7" },
          },
          labels: { markers: { render: (marker) => marker.name } },
        });
      })
      .catch(() => { });

    return () => {
      cancelled = true;
      mapInstance.current?.destroy?.();
    };
  }, []);

  return (
    <div className="col-xl-7">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-start mb-3">
            <div className="flex-grow-1">
              <h5 className="card-title">Sales Revenue</h5>
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
                  <span className="fw-semibold">Year:</span>{" "}
                  <span className="text-muted">2021<i className="mdi mdi-chevron-down ms-1"></i></span>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" href="#">2019</a>
                  <a className="dropdown-item" href="#">2020</a>
                  <a className="dropdown-item" href="#">2021</a>
                </div>
              </div>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-xxl-7">
              <div className="py-3">
                <div ref={mapRef} style={{ height: "300px" }}></div>
              </div>
            </div>

            <div className="col-xl-5">
              <div className="table-responsive">
                <table className="table table-centered align-middle table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "500px" }}>Countries</th>
                      <th>Orders</th>
                      <th>Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((c) => (
                      <tr key={c.name}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={c.flag} className="rounded" alt="" height="18" />
                            <div className="flex-grow-1 ms-3">
                              <p className="mb-0 text-truncate">{c.name}</p>
                            </div>
                          </div>
                        </td>
                        <td>{c.orders}</td>
                        <td>{c.earnings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
