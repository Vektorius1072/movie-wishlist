import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const marquee = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marquee",
});

const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Синеклуб — общий вишлист фильмов",
  description: "Собирайте фильмы, которые хотите посмотреть, вместе с семьёй и друзьями",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${marquee.variable} ${body.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
