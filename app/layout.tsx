import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cáncer Global · Dashboard",
  description: "Análisis exploratorio de pacientes con cáncer a nivel mundial",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-poppins)]" style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
