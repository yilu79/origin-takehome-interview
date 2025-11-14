import type { Metadata } from "next";
import "../src/styles/globals/globals.css";
import "../src/styles/globals/shared.css";

export const metadata: Metadata = {
  title: "Origin Therapy Session Management",
  description:
    "A comprehensive therapy session management system for therapists and patients",
  keywords: ["therapy", "session management", "healthcare", "appointments"],
  authors: [{ name: "Origin Health" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
