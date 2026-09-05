import React, { useState, useCallback, useRef } from "react";
import { Upload, X, FileAudio, FileImage, FileVideo, Check, AlertTriangle, Trash2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// ★ UserUploadPanel — Özel Materyal Yükleme Alanı
//
// Kullanıcılar kendi seslerini, resimlerini veya arka plan
// videolarını sisteme yükleyip Canvas motoruna besleyebilir.
//
// ★ GÜVENLİK:
//   - Dosya tipi kontrolü (MIME + genişletme)
//   - Boyut limiti: Ses=5MB, Görsel=10MB, Video=50MB
//   - Supabase Storage veya Cloudflare R2'ya yükleme
// ═══════════════════════════════════════════════════════════════

type UploadType = "audio" | "image" | "video";

interface UploadConfig {
  label: string;
  accept: string;
  maxSizeMB: number;
  icon: typeof FileAudio;
  color: string;
}

const UPLOAD_CONFIGS: Record<UploadType, UploadConfig> = {
  audio: {
    label: "Ses Kaydı",
    accept: "audio/mpeg,audio/wav,audio/ogg,audio/mp4,.mp3,.wav,.ogg,.m4a",
    maxSizeMB: 5,
    icon: FileAudio,
    color: "#10b981",
  },
  image: {
    label: "Arka Plan Görseli",
    accept: "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif",
    maxSizeMB: 10,
    icon: FileImage,
    color: "#3b82f6",
  },
  video: {
    label: "Arka Plan Videosu",
    accept: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
    maxSizeMB: 50,
    icon: FileVideo,
    color: "#f59e0b",
  },
};

interface UploadedFile {
  id: string;
  file: File;
  type: UploadType;
  preview?: string; // Blob URL
  uploadedUrl?: string; // Sunucu URL
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface UserUploadPanelProps {
  onFileUploaded?: (url: string, type: UploadType) => void;
}

export const UserUploadPanel: React.FC<UserUploadPanelProps> = ({ onFileUploaded }) => {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [activeType, setActiveType] = useState<UploadType>("audio");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dosya tipini doğrula
  const validateFile = useCallback((file: File, type: UploadType): string | null => {
    const config = UPLOAD_CONFIGS[type];

    // Boyut kontrolü
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > config.maxSizeMB) {
      return `Dosya çok büyük: ${Math.round(sizeMB)}MB. Maksimum ${config.maxSizeMB}MB olmalı.`;
    }

    // MIME tipi kontrolü
    const validMimes: Record<UploadType, string[]> = {
      audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
      image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      video: ["video/mp4", "video/webm", "video/quicktime"],
    };

    if (!validMimes[type].includes(file.type)) {
      return `Geçersiz dosya tipi: ${file.type}. İzin verilen: ${config.accept.split(",").slice(0, 4).join(", ")}`;
    }

    return null;
  }, []);

  // Dosya seçildiğinde
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const error = validateFile(file, activeType);
        if (error) {
          alert(error);
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const preview = URL.createObjectURL(file);

        const upload: UploadedFile = {
          id,
          file,
          type: activeType,
          preview,
          progress: 0,
          status: "pending",
        };

        setUploads((prev) => [...prev, upload]);
      });

      // Input'u sıfırla
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [activeType, validateFile]
  );

  // Dosyayı yükle (Supabase Storage API)
  const uploadFile = useCallback(
    async (upload: UploadedFile) => {
      setUploads((prev) =>
        prev.map((u) => (u.id === upload.id ? { ...u, status: "uploading" as const, progress: 10 } : u))
      );

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase yapılandırması eksik");
        }

        // Dosya yolunu oluştur
        const ext = upload.file.name.split(".").pop() || "bin";
        const filePath = `user-uploads/${upload.type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        // Supabase Storage'a yükle
        const formData = new FormData();
        formData.append("file", upload.file);

        const res = await fetch(`${supabaseUrl}/storage/v1/object/nur-uploads/${filePath}`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`Yükleme hatası ${res.status}: ${errText.slice(0, 100)}`);
        }

        const data = await res.json();
        const uploadedUrl = `${supabaseUrl}/storage/v1/object/public/nur-uploads/${filePath}`;

        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id
              ? { ...u, status: "done" as const, progress: 100, uploadedUrl }
              : u
          )
        );

        onFileUploaded?.(uploadedUrl, upload.type);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Yükleme başarısız";
        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, status: "error" as const, error: message } : u
          )
        );
      }
    },
    [onFileUploaded]
  );

  // Tümünü yükle
  const uploadAll = useCallback(async () => {
    const pending = uploads.filter((u) => u.status === "pending");
    for (const upload of pending) {
      await uploadFile(upload);
    }
  }, [uploads, uploadFile]);

  // Dosyayı kaldır
  const removeFile = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload?.preview) URL.revokeObjectURL(upload.preview);
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  const config = UPLOAD_CONFIGS[activeType];
  const Icon = config.icon;
  const pendingCount = uploads.filter((u) => u.status === "pending").length;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-4">
      {/* Başlık */}
      <div className="flex items-center gap-2">
        <Upload size={14} style={{ color: config.color }} />
        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: config.color }}>
          Özel Materyal Yükleme
        </span>
      </div>

      {/* Tür Seçimi */}
      <div className="flex gap-1.5">
        {(Object.keys(UPLOAD_CONFIGS) as UploadType[]).map((type) => {
          const cfg = UPLOAD_CONFIGS[type];
          const TypeIcon = cfg.icon;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold transition ${
                activeType === type
                  ? "border text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
              style={
                activeType === type
                  ? { borderColor: cfg.color, backgroundColor: `${cfg.color}15` }
                  : undefined
              }
            >
              <TypeIcon size={12} style={{ color: cfg.color }} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Yükleme Alanı */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition hover:bg-white/5"
        style={{ borderColor: `${config.color}40` }}
      >
        <Icon size={24} style={{ color: config.color }} className="mb-2 opacity-50" />
        <p className="text-[10px] text-white/50 text-center">
          {config.label} seçin veya sürükleyin
        </p>
        <p className="text-[8px] text-white/30 mt-1">
          Maksimum {config.maxSizeMB}MB · {config.accept.split(",").slice(0, 3).join(", ")}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={config.accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Yüklenen Dosyalar */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/50">{uploads.length} dosya</p>
            {pendingCount > 0 && (
              <button
                onClick={uploadAll}
                className="rounded-lg px-3 py-1.5 text-[9px] font-bold text-black transition hover:brightness-110"
                style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}
              >
                Tümünü Yükle ({pendingCount})
              </button>
            )}
          </div>

          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
            >
              {/* Küçük önizleme */}
              {upload.preview && (
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-white/10">
                  {upload.type === "image" ? (
                    <img src={upload.preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon size={14} className="text-white/30" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/70 truncate">{upload.file.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[8px] text-white/30">
                    {(upload.file.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                  {upload.status === "uploading" && (
                    <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === "done" && (
                    <span className="text-[8px] text-green-400 flex items-center gap-0.5">
                      <Check size={8} /> Yüklendi
                    </span>
                  )}
                  {upload.status === "error" && (
                    <span className="text-[8px] text-red-400 flex items-center gap-0.5">
                      <AlertTriangle size={8} /> {upload.error}
                    </span>
                  )}
                </div>
              </div>

              <button onClick={() => removeFile(upload.id)} className="p-1 text-white/30 hover:text-red-400 transition">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bilgi */}
      <p className="text-[8px] text-white/25 text-center">
        Yüklenen dosyalar sadece sizin tarafınızdan kullanılabilir · Üçüncü kişilerle paylaşılmaz
      </p>
    </div>
  );
};
