import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users,
  Settings,
  ChevronLeft,
  Shield,
  CreditCard,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/tenant-dashboard',
    color: "text-sky-500"
  },
  {
    label: 'Team Members',
    icon: Users,
    href: '/tenant-dashboard/team',
    color: "text-violet-500"
  },
  {
    label: 'Roles & Permissions',
    icon: Shield,
    href: '/tenant-dashboard/roles',
    color: "text-orange-500"
  },
  {
    label: 'Subscription',
    icon: CreditCard,
    href: '/tenant-dashboard/subscription',
    color: "text-emerald-500"
  },
  {
    label: 'Activity Logs',
    icon: Activity,
    href: '/tenant-dashboard/activity',
    color: "text-blue-500"
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/tenant-dashboard/settings',
    color: "text-gray-500"
  }
];

interface TenantSidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function TenantSidebar({ isCollapsed, onCollapse }: TenantSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="relative h-full bg-[#111827] text-white">
      <div className={cn(
        "flex flex-col h-full duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}>
        <div className="px-3 py-2 flex-1">
          <div className={cn(
            "flex items-center pl-3 mb-14 duration-300",
            isCollapsed ? "justify-center pl-0" : "justify-start"
          )}>
            <h1 className={cn(
              "font-bold transition-all duration-300",
              isCollapsed ? "text-lg" : "text-2xl"
            )}>
              {isCollapsed ? "TD" : "Tenant Dashboard"}
            </h1>
          </div>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                title={isCollapsed ? route.label : undefined}
              >
                <div className={cn(
                  "flex items-center flex-1",
                  isCollapsed ? "justify-center" : "justify-start"
                )}>
                  <route.icon className={cn("h-5 w-5", route.color, isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Button
        onClick={() => onCollapse(!isCollapsed)}
        variant="ghost"
        className={cn(
          "h-8 w-8 absolute -right-4 top-7 rounded-full border border-zinc-700 bg-[#111827] p-0 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all",
          isCollapsed && "rotate-180"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
} 