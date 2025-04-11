import type { Metadata } from "next";
import { Source_Sans_3 as FontSans, Source_Serif_4 as FontSerif } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900']
});
const fontSerif = FontSerif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "Conference Master",
  description: "Effortlessly plan, manage, and elevate your events with Conference Master — the all-in-one platform for streamlined conference organization, attendee engagement, and impactful experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} font-sans ${fontSerif.variable} font-serif antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
