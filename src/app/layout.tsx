import "./globals.css";
import { Inter } from "next/font/google";
import NotificationProvider from "@/components/NotificationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Quran Reader - قرآن مجید",
  description: "Read the Holy Quran with Urdu translation",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
