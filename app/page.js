import { redirect } from "next/navigation";

export default function RootPage() {
  // Ganti logika ini nanti dengan pengecekan session/token sesungguhnya
  redirect("/login");
}
