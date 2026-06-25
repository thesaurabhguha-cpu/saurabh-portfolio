import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSM Dashboard — Saurabh Guha",
  description: "Customer Success Manager Portfolio — Churn Risk Predictor & QBR Generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
