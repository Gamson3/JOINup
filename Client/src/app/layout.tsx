import type { Metadata } from "next";
import { Source_Sans_3 as FontSans, Source_Serif_4 as FontSerif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import StoreProvider from "../state/redux";

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
  title: "JOINup - Conferences Made Easy",
  description: "Effortlessly plan, manage, and elevate your events with Conference Master — the all-in-one platform for streamlined conference organization, attendee engagement, and impactful experiences.",
  keywords: "conference, events, management, education, free",
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
        <StoreProvider>
          <AuthProvider>
            {children}  
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
