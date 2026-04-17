import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Mail,
  LogOut,
  ShieldCheck,
  X,
  LayoutTemplate,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "მთავარი",        path: "/admin/dashboard" },
  { icon: FileText,        label: "ბლოგი",           path: "/admin/blog" },
  { icon: Users,           label: "გუნდი",           path: "/admin/team" },
  { icon: Building2,       label: "პარტნიორები",     path: "/admin/partners" },
  { icon: Mail,            label: "შეტყობინებები",   path: "/admin/messages" },
  { icon: LayoutTemplate,  label: "გვერდები",        path: "/admin/pages" },
  { icon: ShieldCheck,     label: "ადმინები",        path: "/admin/users" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "contacts"), where("read", "==", false));
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
    return unsub;
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/admin", { replace: true });
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Balance101</p>
            <p className="text-xs text-slate-400 mt-0.5">ადმინისტრაციული პანელი</p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="დახურვა"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => handleNav(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${
                  isActive
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon size={16} strokeWidth={1.6} />
                {label}
                {path === "/admin/messages" && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-4.5 text-center leading-tight">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <LogOut size={16} strokeWidth={1.6} />
            გამოსვლა
          </button>
        </div>
      </aside>
    </>
  );
}
