import { NavLink, Outlet } from "react-router-dom";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/state/taskStore";
import { AdBanner } from "@/components/AdBanner";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppNavigator() {
  const { adsVisible } = useTaskStore();

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      {adsVisible && <AdBanner />}
      <footer className="bg-background border-t z-20">
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
  );
}