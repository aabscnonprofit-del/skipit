import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "SkipIt — Real-Time Driver Signals",
  description:
    "Know where NOT to go. Real-time delivery driver signals for delays, closures, and bad orders.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SkipIt",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased min-h-screen overflow-x-hidden">
        <div className="bg-grid min-h-screen flex flex-col">
          
          {/* HEADER */}
          <Header />

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-28">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}