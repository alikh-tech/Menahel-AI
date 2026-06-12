import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "מנהל.AI - הניהול האקדמי החכם שלך",
  description:
    "פלטפורמת ניהול אקדמי חכמה לסטודנטים - מסמכים, כספים, תזכורות ועוזר AI אישי במקום אחד.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
