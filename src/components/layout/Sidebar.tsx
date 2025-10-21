import {
  LayoutDashboard,
  BarChart2,
  Database,
  HelpCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SidebarLink = ({ icon: Icon, children, active = false }: { icon: React.ElementType, children: React.ReactNode, active?: boolean }) => (
  <a
    href="#"
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
      active && "bg-muted text-primary"
    )}
  >
    <Icon className="h-4 w-4" />
    {children}
  </a>
);

export const Sidebar = () => {
  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="Newen Logo" className="h-8 object-contain" />
          </a>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <SidebarLink icon={LayoutDashboard} active>
              Dashboard
            </SidebarLink>
            <SidebarLink icon={BarChart2}>Analytics</SidebarLink>
            <SidebarLink icon={Database}>Databases</SidebarLink>
            <SidebarLink icon={HelpCircle}>Help</SidebarLink>
            <SidebarLink icon={Settings}>Settings</SidebarLink>
          </nav>
        </div>
      </div>
    </div>
  );
};