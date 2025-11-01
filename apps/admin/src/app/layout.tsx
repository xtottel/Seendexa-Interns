import type React from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/styles/globals.css";
//import { Toaster } from "react-hot-toast";
import { Toaster as Exatoast } from 'sonner'
//import Script from "next/script";



const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Sendexa Admin",
    template: "%s | Sendexa",
  },
  authors: [{ name: "Sendexa Team", url: "https://sendexa.co" }],
  creator: "Sendexa",
  publisher: "Xtottel Technologies",
  metadataBase: new URL("https://app.sendexa.co"),
  openGraph: {
    title: "Sendexa Dashboard",
    description:
      "Access the Sendexa dashboard to send messages, manage contacts, view reports, and buy SMS credits.",
    url: "https://app.sendexa.co",
    siteName: "Sendexa",
    images: [
      {
        url: "https://sendexa.co/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "Sendexa Dashboard",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "mask-icon",
      url: "/safari-pinned-tab.svg",
      color: "#3a0ca3",
    },
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
      
          {children}
          <Exatoast position="top-center" expand={true} richColors />
          {/* <Toaster position="top-center" reverseOrder={false} /> */}

          {/* Tidio live chat script */}
         {/* <Script
          src="https://code.tidio.co/o93ckmtrvwarfdtztq2dbz0ghzunte8r.js"
          strategy="afterInteractive"
        />  */}
      </body>
    </html>
  );
}
