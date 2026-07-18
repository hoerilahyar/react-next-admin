// Toggles the vertical sidebar, mirroring the original template's behavior:
// on small screens it slides the sidebar in/out, on large screens it
// collapses it to icon-only mode.
export function toggleSidebar() {
  if (typeof document === "undefined") return;

  document.body.classList.toggle("sidebar-enable");

  if (window.innerWidth >= 992) {
    const current = document.body.getAttribute("data-sidebar-size");
    document.body.setAttribute("data-sidebar-size", current === "sm" ? "lg" : "sm");
  }
}
