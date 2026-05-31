import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutWrapper } from "@/components/layout-wrapper";
import ScrollToHash from "@/components/scroll-to-hash";

const inter = Inter({
  subsets: ["latin"],
});

// Static metadata — avoids DB calls during Vercel's build/static-generation phase
export const metadata = {
  title: "Harshit's Portfolio",
  description: "Professional Full-Stack Developer Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.className} antialiased`}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider delayDuration={0}>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </TooltipProvider>
        </ThemeProvider>
        <ScrollToHash />
      </body>
    </html>
  );
}