export function formatDateTime(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");

  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const h = pad(d.getHours());
  const i = pad(d.getMinutes());
  const s = pad(d.getSeconds());

  return `${yyyy}-${mm}-${dd} ${h}:${i}:${s}`;
}

export function formatDate(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");

  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const h = pad(d.getHours());
  const i = pad(d.getMinutes());
  const s = pad(d.getSeconds());

  return `${yyyy}-${mm}-${dd}`;
}