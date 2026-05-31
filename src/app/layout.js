import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutWrapper } from "@/components/layout-wrapper";
import ScrollToHash from "@/components/scroll-to-hash";
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';

const inter = Inter({
  subsets: ["latin"],
});

export async function generateMetadata() {
  try {
    await connectDB();
    const profile = await Profile.findOne({});
    if (profile) {
      return {
        title: profile.name || "Developer Portfolio",
        description: profile.bio || "Professional Developer Portfolio",
        icons: {
          icon: profile.imageUrl || "",
        }
      };
    }
  } catch (error) {
    console.error("Failed to generate metadata/favicon dynamically:", error);
  }
  return {
    title: "Developer Portfolio",
    description: "Professional Developer Portfolio",
    icons: {
      icon: "/quby.jpg",
    }
  };
}

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