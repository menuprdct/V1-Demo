import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/contexts/LangContext";
import LayoutWithLoader from "@/subComp/LayoutWithLoader";
import MenuHeader from "@/components/header/header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menu App",
  description: "Discover our interactive, mobile-friendly digital menu. Browse food items, view ratings, and submit your own reviews — all in a smooth, multilingual experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LangProvider>
          <LayoutWithLoader>
            <div className="flex justify-end p-4">
              <MenuHeader
                logoUrl="https://i.ibb.co/mVkfBRkr/W-Letter.png"
                title="Yummy Menu"
                subtitle="Discover & Order Instantly"
              />
            </div>
            {children}
          </LayoutWithLoader>
        </LangProvider>
      </body>
    </html>
  );
}
