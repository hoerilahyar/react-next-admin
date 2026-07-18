import Script from "next/script";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Dashboard | webadmin - Admin & Dashboard Template",
  description: "Premium Multipurpose Admin & Dashboard Template",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="shortcut icon" href="/assets/images/favicon.ico" />
        <link href="/assets/libs/jsvectormap/css/jsvectormap.min.css" rel="stylesheet" type="text/css" />
        <link href="/assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
        <link href="/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
        <link href="/assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
        <link href="/assets/libs/gridjs/theme/mermaid.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/libs/sweetalert2/sweetalert2.min.css" rel="stylesheet" type="text/css" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>

        {/*
          Vendor scripts used by the extracted components:
          - bootstrap.bundle: powers every `data-bs-toggle="dropdown"` menu
          - metismenujs: sidebar submenu expand/collapse (initialized in Sidebar.js)
          - simplebar: custom scrollbars on elements with `data-simplebar`
          - apexcharts / jsvectormap: read via `window.ApexCharts` / `window.jsVectorMap`
            inside the dashboard chart components (see lib/chart-utils.js)

          Note: the template's original `app.js` and `dashboard.init.js` are
          intentionally NOT loaded here. `app.js` reaches for DOM nodes that
          only exist in the full multi-layout demo (the horizontal-layout
          topbar, the theme-settings drawer) and throws if they're missing;
          `dashboard.init.js` would double-initialize the same chart ids our
          React components already own. The handful of behaviors we actually
          need (sidebar collapse, active-link highlighting) are reimplemented
          in React instead — see lib/sidebar-toggle.js and components/Sidebar.js.
        */}
        <Script src="/assets/libs/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="/assets/libs/metismenujs/metismenujs.min.js" strategy="afterInteractive" />
        <Script src="/assets/libs/simplebar/simplebar.min.js" strategy="afterInteractive" />
        <Script src="/assets/libs/apexcharts/apexcharts.min.js" strategy="afterInteractive" />
        <Script src="/assets/libs/jsvectormap/js/jsvectormap.min.js" strategy="afterInteractive" />
        <Script src="/assets/libs/jsvectormap/maps/world-merc.js" strategy="afterInteractive" />
        <Script src="/assets/libs/gridjs/gridjs.umd.js" strategy="afterInteractive" />
        <script src="assets/libs/sweetalert2/sweetalert2.min.js" strategy="afterInteractive"></script>
      </body>
    </html>
  );
}
