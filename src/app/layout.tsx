// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { LangProvider } from "@/i18n/LangProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

export const metadata = {
  title: "ZB Impact",
  description: "Find free clinics near you",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} app-shell`}>
        <LangProvider>
          <AuthProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
