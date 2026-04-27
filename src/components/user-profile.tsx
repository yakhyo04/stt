"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) return null;

  return (
    <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors group relative">
      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold uppercase shrink-0">
        {session.user.name?.substring(0, 2) || "U"}
      </div>
      <div className="hidden md:block flex-1 overflow-hidden">
        <h3 className="text-sm font-bold text-slate-800 truncate">{session.user.name}</h3>
        <p className="text-xs font-medium text-slate-500 truncate">User</p>
      </div>
      <button 
        onClick={() => signOut()}
        className="opacity-0 group-hover:opacity-100 md:relative absolute right-0 bg-white border border-slate-200 shadow-sm p-1.5 rounded-md text-slate-500 hover:text-red-600 transition-all"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
