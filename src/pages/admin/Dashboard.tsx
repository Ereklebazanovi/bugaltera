import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { BookOpen, UserCheck, Building2, MessageSquare } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
interface ActivityItem {
  label: string;
  detail: string;
  time: string;
  createdAt: Date;
}

function formatRelative(date: Date): string {
  const diffMs    = Date.now() - date.getTime();
  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins < 1)   return "ახლახანს";
  if (diffMins < 60)  return `${diffMins} წუთის წინ`;
  if (diffHours < 24) return `${diffHours} საათის წინ`;
  if (diffDays === 1) return "გუშინ";
  if (diffDays < 7)   return `${diffDays} დღის წინ`;
  return date.toLocaleDateString("ka-GE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [postsCount, setPostsCount]       = useState<number | null>(null);
  const [teamCount, setTeamCount]         = useState<number | null>(null);
  const [partnersCount, setPartnersCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount]     = useState<number | null>(null);
  const [activity, setActivity]           = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const fetchCounts = useCallback(async () => {
    const [postsSnap, teamSnap, partnersSnap, unreadSnap] = await Promise.all([
      getDocs(collection(db, "posts")),
      getDocs(collection(db, "team")),
      getDocs(collection(db, "partners")),
      getDocs(query(collection(db, "contacts"), where("read", "==", false))),
    ]);
    setPostsCount(postsSnap.size);
    setTeamCount(teamSnap.size);
    setPartnersCount(partnersSnap.size);
    setUnreadCount(unreadSnap.size);
  }, []);

  const fetchActivity = useCallback(async () => {
    setLoadingActivity(true);
    try {
      const [postsSnap, partnersSnap, messagesSnap] = await Promise.all([
        getDocs(query(collection(db, "posts"),    orderBy("createdAt", "desc"), limit(3))),
        getDocs(query(collection(db, "partners"), orderBy("createdAt", "desc"), limit(3))),
        getDocs(query(collection(db, "contacts"), orderBy("createdAt", "desc"), limit(3))),
      ]);

      const items: ActivityItem[] = [];

      postsSnap.docs.forEach((d) => {
        const data = d.data();
        const date: Date | null = data.createdAt ? data.createdAt.toDate() : null;
        if (date) items.push({
          label: "ახალი სტატია გამოქვეყნდა",
          detail: data.title_ka ?? data.title_en ?? "—",
          time: formatRelative(date),
          createdAt: date,
        });
      });

      partnersSnap.docs.forEach((d) => {
        const data = d.data();
        const date: Date | null = data.createdAt ? data.createdAt.toDate() : null;
        if (date) items.push({
          label: "ახალი პარტნიორი დაემატა",
          detail: data.name_ka ?? data.name_en ?? "—",
          time: formatRelative(date),
          createdAt: date,
        });
      });

      messagesSnap.docs.forEach((d) => {
        const data = d.data();
        const date: Date | null = data.createdAt ? data.createdAt.toDate() : null;
        if (date) items.push({
          label: "ახალი შეტყობინება მოვიდა",
          detail: data.name ?? "—",
          time: formatRelative(date),
          createdAt: date,
        });
      });

      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setActivity(items.slice(0, 5));
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    fetchActivity();
  }, [fetchCounts, fetchActivity]);

  const stats = [
    { icon: BookOpen,      label: "გამოქვეყნებული სტატია", value: postsCount,    route: "/admin/blog" },
    { icon: UserCheck,     label: "გუნდის წევრი",           value: teamCount,     route: "/admin/team" },
    { icon: Building2,     label: "აქტიური პარტნიორი",      value: partnersCount, route: "/admin/partners" },
    { icon: MessageSquare, label: "შეტყობინებები",           value: unreadCount,   route: "/admin/messages", badge: "გაუხსნელი" },
  ];

  return (
    <AdminLayout title="მთავარი / მიმოხილვა">
      <main className="flex-1 p-4 md:p-8 space-y-6">

        {/* Content stat cards — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {stats.map(({ icon: Icon, label, value, route, badge }) => (
            <button
              key={label}
              onClick={() => navigate(route)}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 text-left hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
                  <Icon size={14} strokeWidth={1.6} className="text-slate-500" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">
                {value === null ? (
                  <span className="inline-block w-10 h-8 bg-slate-100 rounded animate-pulse" />
                ) : value}
              </p>
              {badge && <p className="mt-1.5 text-xs text-blue-500">{badge}</p>}
            </button>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">ბოლო აქტივობა</h2>
          </div>
          {loadingActivity ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            </div>
          ) : activity.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">აქტივობა არ არის</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.map(({ label, detail, time }, i) => (
                <li key={i} className="px-4 md:px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 font-medium">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </main>
    </AdminLayout>
  );
}
