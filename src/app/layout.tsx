import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Healthcare for All",
  description: "Find free clinics near you",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black">
        <NavBar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
