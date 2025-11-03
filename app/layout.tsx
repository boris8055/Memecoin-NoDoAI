import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RefuseBot - The AI That Refuses Everything",
  description: "An AI capybara that stubbornly refuses to do anything... or does it? Find the secret phrase and win $10,000!",
  keywords: ["AI", "memecoin", "bounty", "crypto", "game"],
  openGraph: {
    title: "RefuseBot - The AI That Refuses Everything",
    description: "Find the secret phrase and win $10,000!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RefuseBot",
    description: "The AI that refuses everything... or does it?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style>{`
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
