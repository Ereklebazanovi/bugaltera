// AdminPartners.tsx

import { useState, useEffect, useRef } from "react";
import { compressImage } from "../../utils/compressImage";
import AdminLayout from "../../layouts/AdminLayout";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Plus,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Users2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Partner {
  id: string;
  name_ka: string;
  name_en: string;
  description_ka: string;
  description_en: string;
  websiteUrl: string;
  logoUrl: string;
  createdAt: { toDate: () => Date } | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CLOUDINARY_CLOUD = "dfz0on2vj";
const CLOUDINARY_PRESET = "balance_preset";

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPartners() {
  const [view, setView] = useState<"table" | "form">("table");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [formLang, setFormLang] = useState<"ka" | "en">("ka");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nameKa, setNameKa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionKa, setDescriptionKa] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const q = query(collection(db, "partners"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPartners(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Partner, "id">) }))
      );
    } finally {
      setLoadingPartners(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setNameKa("");
    setNameEn("");
    setDescriptionKa("");
    setDescriptionEn("");
    setWebsiteUrl("");
    clearImage();
    setError(null);
    setEditingPartner(null);
    setFormLang("ka");
  };

  const openAddForm = () => { resetForm(); setView("form"); };

  const openEditForm = (partner: Partner) => {
    setEditingPartner(partner);
    setNameKa(partner.name_ka ?? "");
    setNameEn(partner.name_en ?? "");
    setDescriptionKa(partner.description_ka ?? "");
    setDescriptionEn(partner.description_en ?? "");
    setWebsiteUrl(partner.websiteUrl ?? "");
    setImagePreview(partner.logoUrl);
    setImageFile(null);
    setError(null);
    setFormLang("ka");
    setView("form");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } finally {
      setCompressing(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();

    if (!nameKa.trim()) {
      setError("გთხოვთ, შეიყვანოთ კომპანიის სახელი ქართულად.");
      setFormLang("ka");
      return;
    }
    if (!descriptionKa.trim()) {
      setError("გთხოვთ, შეიყვანოთ აღწერა ქართულად.");
      setFormLang("ka");
      return;
    }
    if (!editingPartner && !imageFile) {
      setError("გთხოვთ, ატვირთოთ ლოგო.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      let logoUrl = editingPartner?.logoUrl ?? "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
          { method: "POST", body: formData }
        );
        if (!res.ok) throw new Error("ლოგოს ატვირთვა ვერ მოხერხდა.");
        logoUrl = (await res.json()).secure_url;
      }

      const payload = {
        name_ka: nameKa,
        name_en: nameEn,
        description_ka: descriptionKa,
        description_en: descriptionEn,
        websiteUrl,
        logoUrl,
      };

      if (editingPartner) {
        await updateDoc(doc(db, "partners", editingPartner.id), payload);
      } else {
        await addDoc(collection(db, "partners"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
      await fetchPartners();
      setView("table");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "შეცდომა მოხდა.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (partner: Partner) => {
    if (!window.confirm("ნამდვილად გსურთ წაშლა?")) return;
    try {
      await deleteDoc(doc(db, "partners", partner.id));
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
    } catch {
      alert("წაშლა ვერ მოხერხდა. სცადეთ თავიდან.");
    }
  };

  const isEditing = editingPartner !== null;

  const pageTitle = view === "table"
    ? "პარტნიორები"
    : isEditing ? "პარტნიორები / რედაქტირება" : "პარტნიორები / ახალი";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title={pageTitle}>
      <main className="flex-1 p-4 md:p-8">
        {view === "table" ? (
          /* ── TABLE VIEW ── */
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">პარტნიორი კომპანიები</h2>
              <button
                onClick={openAddForm}
                className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-3.5 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Plus size={13} />
                ახალი პარტნიორი
              </button>
            </div>
            {loadingPartners ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users2 size={28} className="text-slate-200" />
                <p className="text-sm text-slate-400">პარტნიორები ვერ მოიძებნა.</p>
                <button onClick={openAddForm} className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors">
                  პირველი პარტნიორის დამატება
                </button>
              </div>
            ) : (
              <>
                {/* Mobile card list */}
                <ul className="md:hidden divide-y divide-slate-100">
                  {partners.map((partner) => (
                    <li key={partner.id} className="p-4 flex gap-3 items-center">
                      {partner.logoUrl ? (
                        <img src={partner.logoUrl} alt="" className="w-14 h-10 object-contain shrink-0" />
                      ) : (
                        <div className="w-14 h-10 bg-slate-100 rounded flex items-center justify-center shrink-0">
                          <ImageIcon size={14} className="text-slate-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{partner.name_ka}</p>
                        {partner.websiteUrl && (
                          <p className="text-xs text-slate-400 truncate">{partner.websiteUrl}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => openEditForm(partner)}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
                          >
                            <Pencil size={11} />
                            რედაქტირება
                          </button>
                          <button
                            onClick={() => handleDelete(partner)}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors"
                          >
                            <Trash2 size={11} />
                            წაშლა
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Desktop table */}
                <table className="hidden md:table w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 w-20">ლოგო</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">სახელი (KA)</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">სახელი (EN)</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">ვებსაიტი</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 w-40">მოქმედება</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          {partner.logoUrl ? (
                            <img src={partner.logoUrl} alt="" className="w-14 h-10 object-contain" />
                          ) : (
                            <div className="w-14 h-10 bg-slate-100 rounded flex items-center justify-center">
                              <ImageIcon size={14} className="text-slate-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{partner.name_ka}</td>
                        <td className="px-4 py-3 text-slate-400">{partner.name_en || "—"}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[180px]">
                          {partner.websiteUrl || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditForm(partner)}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Pencil size={11} />
                              რედაქტირება
                            </button>
                            <button
                              onClick={() => handleDelete(partner)}
                              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Trash2 size={11} />
                              წაშლა
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        ) : (
          /* ── FORM VIEW ── */
          <div className="max-w-2xl">
            <button
              onClick={() => { resetForm(); setView("table"); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-5 transition-colors"
            >
              <ArrowLeft size={13} />
              პარტნიორებზე დაბრუნება
            </button>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">
                  {isEditing ? "პარტნიორის რედაქტირება" : "ახალი პარტნიორის დამატება"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="px-4 md:px-6 py-5 space-y-5">
                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
                )}

                {/* ── Language Tab ── */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">ენა / Language</p>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                    <button
                      type="button"
                      onClick={() => setFormLang("ka")}
                      className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${
                        formLang === "ka" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      ქართული
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormLang("en")}
                      className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${
                        formLang === "en" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* ── Language-specific fields ── */}
                {formLang === "ka" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        კომპანიის სახელი <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={nameKa}
                        onChange={(e) => setNameKa(e.target.value)}
                        placeholder="მაგ: TBC Bank"
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        მოკლე აღწერა <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={descriptionKa}
                        onChange={(e) => setDescriptionKa(e.target.value)}
                        placeholder="კომპანიის მოკლე აღწერა..."
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Company Name
                        <span className="text-slate-400 font-normal ml-1">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="e.g. TBC Bank"
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Short Description
                        <span className="text-slate-400 font-normal ml-1">(optional)</span>
                      </label>
                      <textarea
                        rows={4}
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        placeholder="Brief company description..."
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none"
                      />
                    </div>
                  </>
                )}

                {/* ── Shared fields ── */}

                {/* Website */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    ვებსაიტის ლინკი
                    <span className="text-slate-400 font-normal ml-1">(არასავალდებულო)</span>
                  </label>
                  <div className="relative">
                    <LinkIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                    />
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    ლოგო{" "}
                    {!isEditing && <span className="text-red-400">*</span>}
                    {isEditing && <span className="text-slate-400 font-normal ml-1">(ახლის ასარჩევად დააჭირეთ)</span>}
                  </label>
                  <div
                    onClick={() => !compressing && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl transition-colors ${
                      compressing ? "cursor-wait opacity-60" : "cursor-pointer"
                    } ${imagePreview ? "border-slate-300" : "border-slate-200 hover:border-slate-400"}`}
                  >
                    {compressing ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Loader2 size={22} className="text-slate-400 animate-spin" />
                        <p className="text-xs text-slate-400">სურათი მუშავდება...</p>
                      </div>
                    ) : imagePreview ? (
                      <div className="flex items-center justify-center py-6 px-8">
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-40 h-24 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <ImageIcon size={22} className="text-slate-300" />
                        <p className="text-xs text-slate-400">დააჭირეთ ლოგოს ასატვირთად</p>
                        <p className="text-xs text-slate-300">PNG, JPG, SVG, WEBP</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  {imagePreview && (
                    <button type="button" onClick={clearImage} className="mt-2 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      ლოგოს წაშლა
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setView("table"); }}
                    className="text-xs text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    გაუქმება
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 text-xs font-medium bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    {submitting ? "იტვირთება..." : isEditing ? "შენახვა" : "პარტნიორის დამატება"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
