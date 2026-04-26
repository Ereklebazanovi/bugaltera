// BlogManagement.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { compressImage } from "../../utils/compressImage";
import AdminLayout from "../../layouts/AdminLayout";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
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
  FileText,
  Plus,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

interface Post {
  id: string;
  title_ka: string;
  title_en: string;
  title_ru: string;
  excerpt_ka: string;
  excerpt_en: string;
  excerpt_ru: string;
  content_ka: string;
  content_en: string;
  content_ru: string;
  coverUrl: string;
  slug: string;
  createdAt: { toDate: () => Date } | null;
}

const CLOUDINARY_CLOUD = "dfz0on2vj";
const CLOUDINARY_PRESET = "balance_preset";
const ASPECT_RATIO = 16 / 9;

// ── Crop helpers ──────────────────────────────────────────────────────────────

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
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas empty"))),
      "image/jpeg",
      0.92
    )
  );
}

// Georgian → Latin transliteration for slug generation
const GEO_LATIN: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t",
  ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh",
  რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k", ღ: "gh", ყ: "q",
  შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh",
  ჯ: "j", ჰ: "h",
};

function generateSlug(title: string): string {
  const words = title
    .split("")
    .map((ch) => GEO_LATIN[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 4);

  const suffix = Math.random().toString(36).slice(2, 6);
  return [...words, suffix].join("-");
}

export default function BlogManagement() {
  const [view, setView] = useState<"table" | "form">("table");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // form fields
  const [formLang, setFormLang] = useState<"ka" | "en" | "ru">("ka");
  const [titleKa, setTitleKa] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [excerptKa, setExcerptKa] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [excerptRu, setExcerptRu] = useState("");
  const [contentKa, setContentKa] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentRu, setContentRu] = useState("");
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

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, "id">) }))
      );
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitleKa(""); setTitleEn(""); setTitleRu("");
    setExcerptKa(""); setExcerptEn(""); setExcerptRu("");
    setContentKa(""); setContentEn(""); setContentRu("");
    clearImage();
    setError(null);
    setEditingPost(null);
    setFormLang("ka");
  };

  const openAddForm = () => {
    resetForm();
    setView("form");
  };

  const openEditForm = (post: Post) => {
    setEditingPost(post);
    setTitleKa(post.title_ka ?? "");
    setTitleEn(post.title_en ?? "");
    setTitleRu(post.title_ru ?? "");
    setExcerptKa(post.excerpt_ka ?? "");
    setExcerptEn(post.excerpt_en ?? "");
    setExcerptRu(post.excerpt_ru ?? "");
    setContentKa(post.content_ka ?? "");
    setContentEn(post.content_en ?? "");
    setContentRu(post.content_ru ?? "");
    setImagePreview(post.coverUrl);
    setImageFile(null);
    setError(null);
    setFormLang("ka");
    setView("form");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCropSrc(URL.createObjectURL(file));
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
      const cropped = new File([blob], "cover.jpg", { type: "image/jpeg" });
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

    if (!titleKa.trim() || !excerptKa.trim() || !contentKa.trim()) {
      setError("გთხოვთ, შეავსოთ სათაური, მოკლე აღწერა და სრული ტექსტი ქართულად.");
      setFormLang("ka");
      return;
    }

    if (!editingPost && !imageFile) {
      setError("გთხოვთ, ატვირთოთ სურათი.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      let coverUrl = editingPost?.coverUrl ?? "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
          { method: "POST", body: formData }
        );
        if (!res.ok) throw new Error("სურათის ატვირთვა ვერ მოხერხდა.");
        const data = await res.json();
        coverUrl = data.secure_url;
      }

      const payload = {
        title_ka: titleKa, title_en: titleEn, title_ru: titleRu,
        excerpt_ka: excerptKa, excerpt_en: excerptEn, excerpt_ru: excerptRu,
        content_ka: contentKa, content_en: contentEn, content_ru: contentRu,
        coverUrl
      };

      if (editingPost) {
        await updateDoc(doc(db, "posts", editingPost.id), payload);
      } else {
        await addDoc(collection(db, "posts"), {
          ...payload,
          slug: generateSlug(titleKa),
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      await fetchPosts();
      setView("table");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "შეცდომა მოხდა.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (post: Post) => {
    if (!window.confirm("ნამდვილად გსურთ წაშლა?")) return;
    try {
      await deleteDoc(doc(db, "posts", post.id));
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      alert("წაშლა ვერ მოხერხდა. სცადეთ თავიდან.");
    }
  };

  const isEditing = editingPost !== null;

  const pageTitle = view === "table"
    ? "ბლოგი / სტატიები"
    : isEditing ? "ბლოგი / რედაქტირება" : "ბლოგი / ახალი სტატია";

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
                {cropping ? "მუშავდება..." : "სურათის დამტკიცება"}
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
                <h2 className="text-sm font-semibold text-slate-800">გამოქვეყნებული სტატიები</h2>
                <button
                  onClick={openAddForm}
                  className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-3.5 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Plus size={13} />
                  ახალი სტატია
                </button>
              </div>

              {loadingPosts ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <FileText size={28} className="text-slate-200" />
                  <p className="text-sm text-slate-400">სტატიები ვერ მოიძებნა.</p>
                  <button
                    onClick={openAddForm}
                    className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
                  >
                    პირველი სტატიის დამატება
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile card list */}
                  <ul className="md:hidden divide-y divide-slate-100">
                    {posts.map((post) => (
                      <li key={post.id} className="p-4 flex gap-3">
                        {post.coverUrl ? (
                          <img src={post.coverUrl} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <ImageIcon size={14} className="text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{post.title_ka}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {post.createdAt?.toDate
                              ? post.createdAt.toDate().toLocaleDateString("ka-GE")
                              : "—"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => openEditForm(post)}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Pencil size={11} />
                              რედაქტირება
                            </button>
                            <button
                              onClick={() => handleDelete(post)}
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
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 w-16">
                          ფოტო
                        </th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">სათაური (KA)</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">სათაური (EN)</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 w-36">
                          თარიღი
                        </th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 w-36">
                          მოქმედება
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            {post.coverUrl ? (
                              <img
                                src={post.coverUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <ImageIcon size={14} className="text-slate-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">{post.title_ka}</td>
                          <td className="px-4 py-3 text-slate-400">{post.title_en || "—"}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {post.createdAt?.toDate
                              ? post.createdAt.toDate().toLocaleDateString("ka-GE")
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditForm(post)}
                                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
                              >
                                <Pencil size={11} />
                                რედაქტირება
                              </button>
                              <button
                                onClick={() => handleDelete(post)}
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
                სტატიებზე დაბრუნება
              </button>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="px-4 md:px-6 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-800">
                    {isEditing ? "სტატიის რედაქტირება" : "ახალი სტატიის დამატება"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="px-4 md:px-6 py-5 space-y-5">
                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}

                  {/* ── Language Tab ── */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">ენა / Language</p>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                      <button type="button" onClick={() => setFormLang("ka")} className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${formLang === "ka" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>ქართული</button>
                      <button type="button" onClick={() => setFormLang("en")} className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${formLang === "en" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>English</button>
                      <button type="button" onClick={() => setFormLang("ru")} className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${formLang === "ru" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Русский</button>
                    </div>
                  </div>

                  {/* ── Language-specific fields ── */}
                  {formLang === "ka" ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">სათაური <span className="text-red-400">*</span></label>
                        <input type="text" value={titleKa} onChange={(e) => setTitleKa(e.target.value)} placeholder="სტატიის სათაური" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">მოკლე აღწერა <span className="text-red-400">*</span></label>
                        <input type="text" value={excerptKa} onChange={(e) => setExcerptKa(e.target.value)} placeholder="მოკლე შინაარსი..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">სრული ტექსტი <span className="text-red-400">*</span></label>
                        <textarea rows={8} value={contentKa} onChange={(e) => setContentKa(e.target.value)} placeholder="სტატიის სრული შინაარსი..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none" />
                      </div>
                    </>
                  ) : formLang === "en" ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Title <span className="text-slate-400 font-normal ml-1">(optional)</span></label>
                        <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Article Title" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Excerpt <span className="text-slate-400 font-normal ml-1">(optional)</span></label>
                        <input type="text" value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} placeholder="Short summary..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Content <span className="text-slate-400 font-normal ml-1">(optional)</span></label>
                        <textarea rows={8} value={contentEn} onChange={(e) => setContentEn(e.target.value)} placeholder="Full article content..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Заголовок <span className="text-slate-400 font-normal ml-1">(необязательно)</span></label>
                        <input type="text" value={titleRu} onChange={(e) => setTitleRu(e.target.value)} placeholder="Заголовок статьи" className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Краткое описание <span className="text-slate-400 font-normal ml-1">(необязательно)</span></label>
                        <input type="text" value={excerptRu} onChange={(e) => setExcerptRu(e.target.value)} placeholder="Краткое содержание..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Полный текст <span className="text-slate-400 font-normal ml-1">(необязательно)</span></label>
                        <textarea rows={8} value={contentRu} onChange={(e) => setContentRu(e.target.value)} placeholder="Полный текст статьи..." className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none" />
                      </div>
                    </>
                  )}

                  {/* Cover image */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      მთავარი ფოტო{" "}
                      {!isEditing && <span className="text-red-400">*</span>}
                      {isEditing && (
                        <span className="text-slate-400 font-normal ml-1">
                          (ახლის ასარჩევად დააჭირეთ)
                        </span>
                      )}
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        imagePreview
                          ? "border-slate-300"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-full aspect-video object-cover rounded-xl"
                        />
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
                      <button
                        type="button"
                        onClick={clearImage}
                        className="mt-2 text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        სურათის წაშლა
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
                      {submitting
                        ? "იტვირთება..."
                        : isEditing
                        ? "შენახვა"
                        : "სტატიის გამოქვეყნება"}
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
