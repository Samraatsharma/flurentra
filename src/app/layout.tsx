import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flurentra",
  description: "Speak English Confidently with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
