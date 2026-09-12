import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Strive | Fitness & Meal Planning",
  description:
    "Personalized fitness, gym, and meal planning system focused on helping users improve their fitness journey.",
  icons: {
    icon: [
      { url: "/strive-logo.png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/strive-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#ed4f28] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
