import type React from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers"; // ✅ import your client provider

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Sendexa Operations",
    template: "%s | Sendexa",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
