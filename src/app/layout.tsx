import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Shortlist", template: "%s | Shortlist" },
  description: "Apply smarter. Land faster. AI-powered job applications tailored to every role.",
  keywords: ["job search", "CV", "cover letter", "AI", "job applications"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
