"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import {
  PhoneCall,
  LayoutDashboard,
  LineChart,
  Settings,
  ChevronRight,
  Command,
  ChevronsUpDown,
  LogOut
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Calls", href: "/", icon: PhoneCall, active: true },
  { name: "Reports", href: "#", icon: LayoutDashboard, hasChild: true },
  { name: "Insights", href: "#", icon: LineChart },
  { name: "Scoring Schemas", href: "#", icon: LayoutDashboard, badge: "New" },
  { name: "Settings", href: "#", icon: Settings, hasChild: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show sidebar on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <div className="flex flex-col w-64 border-r border-slate-200 bg-slate-50/50 min-h-screen">
      {/* Workspace Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200 gap-3 cursor-pointer hover:bg-slate-100/80 transition-colors">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm">
          <Command className="w-4 h-4" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h2 className="text-sm font-bold text-slate-800 truncate">Demo workspace</h2>
          <p className="text-xs font-medium text-slate-500 truncate">Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group",
              pathname === item.href || item.active
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 shrink-0 transition-colors", 
              pathname === item.href || item.active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
            )} />
            <span className="flex-1 truncate">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-0 h-5 px-2 py-0 text-[10px] font-bold tracking-wide rounded-md">
                {item.badge}
              </Badge>
            )}
            {item.hasChild && (
              <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
