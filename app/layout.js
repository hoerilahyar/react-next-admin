import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Admin Dashboard",
  description: "Boilerplate Next.js untuk Auth & Dashboard (siap diisi template ThemeForest)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
