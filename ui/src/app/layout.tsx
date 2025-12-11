import type { Metadata } from "next";
import { Lato, Lugrasimo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const lugrasimo = Lugrasimo({
  variable: "--font-lugrasimo",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Kairo",
  description: "Content strategy powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${lugrasimo.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
