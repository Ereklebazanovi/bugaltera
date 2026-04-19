//AdminTeam.tsx

import { useState, useEffect, useRef, useCallback } from "react";
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
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { db } from "../../lib/firebase";
import {
  Users,
  Plus,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Check,
  X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Member {
  id: string;
  name_ka: string;
  name_en: string;
  role_ka: string;
  role_en: string;
  bio_ka: string;
  bio_en: string;
  linkedin: string;
  photoUrl: string;
  slug?: string;
  specializations_ka?: string[];
  specializations_en?: string[];
  createdAt: { toDate: () => Date } | null;
}
// ── Crop helper ───────────────────────────────────────────────────────────────

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedBlob(src: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas empty"))),
      "image/jpeg",
      0.92
    )
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CLOUDINARY_CLOUD = "dfz0on2vj";
const CLOUDINARY_PRESET = "balance_preset";
const ASPECT_RATIO = 3 / 4; // portrait

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminTeam() {
  const [view, setView] = useState<"table" | "form">("table");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // form fields
  const [formLang, setFormLang] = useState<"ka" | "en">("ka");
  const [nameKa, setNameKa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [roleKa, setRoleKa] = useState("");
  const [roleEn, setRoleEn] = useState("");
  const [bioKa, setBioKa] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [slug, setSlug] = useState("");
  const [specializationsKaStr, setSpecializationsKaStr] = useState("");
  const [specializationsEnStr, setSpecializationsEnStr] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const q = query(collection(db, "team"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setMembers(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, "id">) }))
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setNameKa(""); setNameEn("");
    setRoleKa(""); setRoleEn("");
    setBioKa(""); setBioEn("");
    setLinkedin("");
    setSlug("");
    setSpecializationsKaStr(""); setSpecializationsEnStr("");
    clearImage();
    setError(null);
    setEditingMember(null);
    setFormLang("ka");
  };

  const openAddForm = () => { resetForm(); setView("form"); };

  const openEditForm = (member: Member) => {
    setEditingMember(member);
    setNameKa(member.name_ka ?? "");
    setNameEn(member.name_en ?? "");
    setRoleKa(member.role_ka ?? "");
    setRoleEn(member.role_en ?? "");
    setBioKa(member.bio_ka ?? "");
    setBioEn(member.bio_en ?? "");
    setLinkedin(member.linkedin ?? "");
    setSlug(member.slug ?? "");
    setSpecializationsKaStr((member.specializations_ka ?? []).join(", "));
    setSpecializationsEnStr((member.specializations_en ?? []).join(", "));
    setImagePreview(member.photoUrl);
    setImageFile(null);
    setCropSrc(null);
    setError(null);
    setFormLang("ka");
    setView("form");
  };

  // ── Crop flow ─────────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const confirmCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setCropping(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
      const cropped = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const compressed = await compressImage(cropped);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
      setCropSrc(null);
    } finally {
      setCropping(false);
    }
  };

  const cancelCrop = () => {
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!nameKa.trim() || !roleKa.trim() || !bioKa.trim()) {
      setError("გთხოვთ, შეავსოთ სახელი, პოზიცია და ბიოგრაფია ქართულად.");
      setFormLang("ka");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      let photoUrl = editingMember?.photoUrl ?? "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
          { method: "POST", body: formData }
        );
        if (!res.ok) throw new Error("ფოტოს ატვირთვა ვერ მოხერხდა.");
        photoUrl = (await res.json()).secure_url;
      }

      const payload = {
        name_ka: nameKa, name_en: nameEn,
        role_ka: roleKa, role_en: roleEn,
        bio_ka: bioKa, bio_en: bioEn,
        linkedin, photoUrl,
        slug: slug.trim(),
        specializations_ka: specializationsKaStr.split(",").map((s: string) => s.trim()).filter(Boolean),
        specializations_en: specializationsEnStr.split(",").map((s: string) => s.trim()).filter(Boolean),
      };

      if (editingMember) {
        await updateDoc(doc(db, "team", editingMember.id), payload);
      } else {
        await addDoc(collection(db, "team"), {
          ...payload, createdAt: serverTimestamp(),
        });
      }
      resetForm();
      await fetchMembers();
      setView("table");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "შეცდომა მოხდა.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (member: Member) => {
    if (!window.confirm("ნამდვილად გსურთ წაშლა?")) return;
    try {
      await deleteDoc(doc(db, "team", member.id));
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch {
      alert("წაშლა ვერ მოხერხდა. სცადეთ თავიდან.");
    }
  };

  const isEditing = editingMember !== null;

  const pageTitle = view === "table"
    ? "გუნდი / წევრები"
    : isEditing ? "გუნდი / რედაქტირება" : "გუნდი / ახალი წევრი";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Crop dialog overlay ── */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT_RATIO}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={false}
              style={{
                containerStyle: { background: "#000" },
                cropAreaStyle: { border: "2px solid rgba(255,255,255,0.6)", borderRadius: "8px" },
              }}
            />
          </div>

          <div className="bg-black/90 px-6 py-5 flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-3 max-w-sm mx-auto w-full">
              <span className="text-white/50 text-xs w-10 text-right">–</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-white h-1 rounded cursor-pointer"
              />
              <span className="text-white/50 text-xs w-10">+</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={cancelCrop}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-colors"
              >
                <X size={14} />
                გაუქმება
              </button>
              <button
                onClick={confirmCrop}
                disabled={cropping}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                {cropping ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {cropping ? "მუშავდება..." : "ფოტოს დამტკიცება"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminLayout title={pageTitle}>
        <main className="flex-1 p-4 md:p-8">
          {view === "table" ? (
            /* ── TABLE VIEW ── */
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">გუნდის წევრები</h2>
                <button
                  onClick={openAddForm}
                  className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-3.5 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Plus size={13} />
                  ახალი წევრი
                </button>
              </div>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Users size={28} className="text-slate-200" />
                  <p className="text-sm text-slate-400">გუნდის წევრები ვერ მოიძებნა.</p>
                  <button onClick={openAddForm} className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors">
                    პირველი წევრის დამატება
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile card list */}
                  <ul className="md:hidden divide-y divide-slate-100">
                    {members.map((member) => (
                      <li key={member.id} className="p-4 flex gap-3">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover object-center shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <ImageIcon size={14} className="text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{member.name_ka}</p>
                          <p className="text-xs text-slate-400 truncate">{member.role_ka}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => openEditForm(member)}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Pencil size={11} />
                              რედაქტირება
                            </button>
                            <button
                              onClick={() => handleDelete(member)}
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
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 w-16">ფოტო</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">სახელი (KA)</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">სახელი (EN)</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 w-48">პოზიცია</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 w-40">მოქმედება</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            {member.photoUrl ? (
                              <img src={member.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover object-center" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <ImageIcon size={14} className="text-slate-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">{member.name_ka}</td>
                          <td className="px-4 py-3 text-slate-400">{member.name_en || "—"}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{member.role_ka}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditForm(member)}
                                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
                              >
                                <Pencil size={11} />
                                რედაქტირება
                              </button>
                              <button
                                onClick={() => handleDelete(member)}
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
                წევრებზე დაბრუნება
              </button>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="px-4 md:px-6 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-800">
                    {isEditing ? "წევრის რედაქტირება" : "ახალი წევრის დამატება"}
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
                      <button type="button" onClick={() => setFormLang("ka")} className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${formLang === "ka" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>ქართული</button>
                      <button type="button" onClick={() => setFormLang("en")} className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${formLang === "en" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>English</button>
                    </div>
                  </div>

                  {/* ── Language-specific fields ── */}
                  {formLang === "ka" ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">სახელი და გვარი <span className="text-red-400">*</span></label>
                        <input type="text" value={nameKa} onChange={(e) => setNameKa(e.target.value)} placeholder="მაგ: თამარ გიორგაძე" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">პოზიცია <span className="text-red-400">*</span></label>
                        <input type="text" value={roleKa} onChange={(e) => setRoleKa(e.target.value)} placeholder="მაგ: მთავარი ბუღალტერი" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">მოკლე ბიოგრაფია <span className="text-red-400">*</span></label>
                        <textarea rows={5} value={bioKa} onChange={(e) => setBioKa(e.target.value)} placeholder="პროფესიული გამოცდილება..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">სპეციალიზაციები<span className="text-slate-400 font-normal ml-1">(მძიმით გამოყოფილი)</span></label>
                        <input type="text" value={specializationsKaStr} onChange={(e) => setSpecializationsKaStr(e.target.value)} placeholder="საგადასახადო საქმე, ფინანსური რეპორტინგი" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                        {specializationsKaStr.trim() && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {specializationsKaStr.split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
                              <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-full">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name <span className="text-slate-400 font-normal ml-1">(optional)</span></label>
                        <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Tamar Giorgadze" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Role <span className="text-slate-400 font-normal ml-1">(optional)</span></label>
                        <input type="text" value={roleEn} onChange={(e) => setRoleEn(e.target.value)} placeholder="e.g. Chief Accountant" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Bio <span className="text-slate-400 font-normal ml-1">(optional)</span></label>
                        <textarea rows={5} value={bioEn} onChange={(e) => setBioEn(e.target.value)} placeholder="Professional experience..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Specializations<span className="text-slate-400 font-normal ml-1">(comma-separated, optional)</span></label>
                        <input type="text" value={specializationsEnStr} onChange={(e) => setSpecializationsEnStr(e.target.value)} placeholder="Tax Audit, Financial Reporting" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                        {specializationsEnStr.trim() && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {specializationsEnStr.split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
                              <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-full">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* URL Slug */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      URL Slug
                      <span className="text-slate-400 font-normal ml-1">(არასავალდებულო — e.g. tamar-giorgadze)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="tamar-giorgadze"
                        className="flex-1 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const src = nameEn || nameKa;
                          setSlug(src.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"));
                        }}
                        className="text-xs px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                    {slug && (
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        URL: /team/<span className="font-mono text-slate-600">{slug}</span>
                      </p>
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      LinkedIn ლინკი
                      <span className="text-slate-400 font-normal ml-1">(არასავალდებულო)</span>
                    </label>
                    <div className="relative">
                      <LinkIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input
                        type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                      />
                    </div>
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      ფოტო{" "}
                      {!isEditing && <span className="text-red-400">*</span>}
                      {isEditing && <span className="text-slate-400 font-normal ml-1">(ახლის ასარჩევად დააჭირეთ)</span>}
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        imagePreview ? "border-slate-300" : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {imagePreview ? (
                        <div className="flex justify-center p-4">
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="w-40 aspect-3/4 object-cover object-top rounded-lg shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                          <ImageIcon size={22} className="text-slate-300" />
                          <p className="text-xs text-slate-400">დააჭირეთ — გაიხსნება ამოჭრის ინსტრუმენტი</p>
                          <p className="text-xs text-slate-300">PNG, JPG, WEBP</p>
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
                        ფოტოს წაშლა
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
                      {submitting ? "იტვირთება..." : isEditing ? "შენახვა" : "წევრის დამატება"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </AdminLayout>
    </>
  );
}
