import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db, firebaseConfig } from "../../lib/firebase";
import { useAuth } from "../../context/authContext";
import AdminLayout from "../../layouts/AdminLayout";
import { UserPlus, Trash2, Shield, Loader2 } from "lucide-react";

interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdmins = async () => {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AdminUser, "uid">) })));
    setLoadingList(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);
    try {
      const secondaryApp =
        getApps().find((a) => a.name === "secondary") ??
        initializeApp(firebaseConfig, "secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const { user: newUser } = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      await secondaryAuth.signOut();

      await setDoc(doc(db, "admins", newUser.uid), {
        email,
        displayName: displayName.trim() || email,
        addedBy: user?.uid ?? "unknown",
        addedAt: serverTimestamp(),
      });

      setEmail("");
      setPassword("");
      setDisplayName("");
      setSuccess("ადმინი წარმატებით დაემატა!");
      fetchAdmins();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("ეს ელ-ფოსტა უკვე Firebase-ში არსებობს.");
      } else {
        setError((err as Error).message || "შეცდომა მოხდა.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (uid: string, adminEmail: string) => {
    if (uid === user?.uid) {
      setError("საკუთარ თავს ვერ წაშლი ადმინებიდან.");
      return;
    }
    if (!confirm(`წაიშალოს ${adminEmail} ადმინებიდან?`)) return;
    await deleteDoc(doc(db, "admins", uid));
    setAdmins((prev) => prev.filter((a) => a.uid !== uid));
  };

  return (
    <AdminLayout title="ადმინები">
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Shield size={20} className="text-slate-500" />
            <h1 className="text-xl font-semibold text-slate-800">ადმინები</h1>
          </div>

          {/* Add form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              ახალი ადმინის დამატება
            </h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="text"
                placeholder="სახელი (არასავალდებულო)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <input
                type="email"
                placeholder="ელ-ფოსტა"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <input
                type="password"
                placeholder="პაროლი (მინ. 6 სიმბოლო)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {adding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                დამატება
              </button>
            </form>
          </div>

          {/* Admin list */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 md:px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                მიმდინარე ადმინები
              </h2>
            </div>
            {loadingList ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : admins.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400 text-center">
                ადმინები არ არის
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <li
                    key={admin.uid}
                    className="flex items-center justify-between px-5 md:px-6 py-4"
                  >
                    <div className="min-w-0 mr-4">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {admin.displayName || admin.email}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {admin.email}
                      </p>
                    </div>
                    {admin.uid === user?.uid ? (
                      <span className="text-xs text-slate-400 italic shrink-0">შენ</span>
                    ) : (
                      <button
                        onClick={() => handleRemove(admin.uid, admin.email)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="ადმინობის მოხსნა"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
