import { useState } from "react";
import type { ReactNode } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { Menu } from "lucide-react";

interface Props {
  title: ReactNode;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset by sidebar width on md+ */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="მენიუ"
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 mb-0.5">ადმინ პანელი</p>
              <h1 className="text-sm font-semibold text-slate-800 leading-none truncate">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
           

          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
