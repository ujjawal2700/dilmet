import { ReactNode } from "react";
import { LayoutDashboard, Calendar, ClipboardList, User } from "lucide-react";
import { LiquidTabBar, type LiquidTab } from "./LiquidTabBar";

const TABS: LiquidTab[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/calendar", label: "Schedule", icon: Calendar },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Content wrapper with dynamic padding offset */}
      <main className="mobile-content-with-nav px-4">
        {children}
      </main>

      {/* Floating Bottom Nav */}
      <LiquidTabBar tabs={TABS} slideTransition />
    </div>
  );
}

export default AppLayout;
