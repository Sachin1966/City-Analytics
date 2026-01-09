import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GitCompare,
  Sliders,
  TrendingUp,
  Lightbulb,
  Database,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Executive Dashboard", href: "/", icon: LayoutDashboard },
  { name: "City Comparison", href: "/comparison", icon: GitCompare },
  { name: "Cost vs Income", href: "/cost-income", icon: Activity },
  { name: "QoL Index Builder", href: "/index-builder", icon: Sliders },
  { name: "Trends & Correlation", href: "/trends", icon: TrendingUp },
  { name: "Insight Explorer", href: "/insights", icon: Lightbulb },
  { name: "Data Quality", href: "/methodology", icon: Database },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Urban Pulse</h1>
          <p className="text-xs text-muted-foreground">City Analytics</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        <p className="mb-2 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Analytics
        </p>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "nav-item",
                isActive && "active"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success pulse-dot" />
          <span className="text-xs text-muted-foreground">Data Updated: Jan 2026</span>
        </div>
      </div>
    </aside>
  );
}
