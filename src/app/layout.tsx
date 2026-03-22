import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PH Defense Monitor",
  description: "A public-facing situational awareness dashboard for the Philippines that visualizes verified and publicly sourced national security-related events.",
  keywords: ["Philippines", "defense", "monitor", "security", "dashboard", "OSINT", "maritime", "insurgency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
