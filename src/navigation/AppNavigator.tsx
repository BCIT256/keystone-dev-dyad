import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/state/taskStore";
import { AdBanner } from "@/components/AdBanner";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppNavigator() {
  const { adsVisible } = useTaskStore();
  const location = useLocation();

  // Nav height is h-20 (5rem, 80px).
  // Ad banner height is approx. 52px (3.25rem).
  // Total fixed height with ads: 80 + 52 = 132px.
  const mainContentPaddingBottom = adsVisible ? '132px' : '80px';

  return (
    <div className="flex flex-col min-h-screen bg-card">
      <main
        className="flex-grow flex flex-col"
        style={{ paddingBottom: mainContentPaddingBottom }}
      >
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 right-0 w-full z-10">
        {adsVisible && <AdBanner />}
        <footer className="bg-background border-t">
          <nav className="container mx-auto flex justify-around items-center h-20 max-w-lg">
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors w-24 pt-2",
                    isActive && "text-primary"
                  )
                }
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}