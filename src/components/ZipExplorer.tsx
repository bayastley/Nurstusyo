import React, { useState, useRef, useCallback } from "react";
import JSZip from "jszip";
import {
  FileArchive, FileCode, FileText, Folder, FolderOpen,
  ChevronRight, ChevronDown, Copy, Check, Search,
  Code2, AlertCircle, File, Eye, FileJson, X,
  Upload, Sparkles,
} from "lucide-react";

export interface ZipFile {
  path: string;
  name: string;
  ext: string;
  content: string;
  isBinary: boolean;
  size: number;
  blobUrl?: string;
}

interface TreeNode {
  name: string;
  fullPath: string;
  isDir: boolean;
  children: Record<string, TreeNode>;
  file?: ZipFile;
}

function buildTree(files: ZipFile[]): TreeNode {
  const root: TreeNode = { name: "", fullPath: "", isDir: true, children: {} };
  files.forEach((f) => {
    const parts = f.path.split("/");
    let node = root;
    parts.forEach((part, idx) => {
      if (!part) return;
      if (!node.children[part]) {
        const isLast = idx === parts.length - 1;
        node.children[part] = {
          name: part,
          fullPath: parts.slice(0, idx + 1).join("/"),
          isDir: !isLast,
          children: {},
          file: isLast ? f : undefined,
        };
      }
      node = node.children[part];
    });
  });
  return root;
}

const EXT_ICON: Record<string, React.ReactNode> = {
  tsx: <FileCode size={13} className="shrink-0 text-cyan-400" />,
  ts: <FileCode size={13} className="shrink-0 text-blue-400" />,
  jsx: <FileCode size={13} className="shrink-0 text-cyan-400" />,
  js: <FileCode size={13} className="shrink-0 text-amber-400" />,
  json: <FileJson size={13} className="shrink-0 text-green-400" />,
  css: <FileText size={13} className="shrink-0 text-pink-400" />,
  html: <FileText size={13} className="shrink-0 text-orange-400" />,
  md: <FileText size={13} className="shrink-0 text-white/60" />,
};

function FileIcon({ ext }: { ext: string }) {
  return (EXT_ICON[ext] as React.ReactElement) ?? <File size={13} className="shrink-0 text-white/40" />;
}

function formatBytes(b: number) {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)}MB`;
  if (b > 1024) return `${(b / 1024).toFixed(0)}KB`;
  return `${b}B`;
}

/* ─── Tree node renderer ────────────────────────────────────────────── */
function TreeItem({
  node, depth, selected, onSelect,
}: {
  node: TreeNode; depth: number; selected: string | null;
  onSelect: (f: ZipFile) => void;
}) {
  const [open, setOpen] = useState(depth < 2);

  if (node.isDir) {
    const kids = Object.values(node.children).sort((a, b) =>
      Number(!b.isDir) - Number(!a.isDir) || a.name.localeCompare(b.name)
    );
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className="flex w-full items-center gap-1.5 rounded py-1 text-left text-[11px] text-white/70 hover:bg-white/5 hover:text-white transition"
        >
          {open ? <ChevronDown size={11} className="shrink-0 text-white/30" /> : <ChevronRight size={11} className="shrink-0 text-white/30" />}
          {open ? <FolderOpen size={13} className="shrink-0 text-amber-400" /> : <Folder size={13} className="shrink-0 text-amber-400/70" />}
          <span className="truncate font-semibold">{node.name}</span>
          <span className="ml-auto shrink-0 text-[9px] text-white/25">{kids.length}</span>
        </button>
        {open && kids.map(k => (
          <TreeItem key={k.fullPath} node={k} depth={depth + 1} selected={selected} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  const f = node.file!;
  const isSelected = selected === f.path;
  return (
    <button
      onClick={() => onSelect(f)}
      style={{ paddingLeft: `${depth * 14 + 6}px` }}
      className={`flex w-full items-center gap-1.5 rounded py-1 pr-2 text-left text-[11px] transition
        ${isSelected ? "bg-[color:var(--accent)]/20 text-[color:var(--accent-2)] font-semibold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
    >
      <FileIcon ext={f.ext} />
      <span className="truncate">{f.name}</span>
      <span className="ml-auto shrink-0 text-[9px] text-white/25">{formatBytes(f.size)}</span>
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
interface Props {
  onClose: () => void;
}

export const ZipExplorer: React.FC<Props> = ({ onClose }) => {
  const [files, setFiles] = useState<ZipFile[]>([]);
  const [zipName, setZipName] = useState<string | null>(null);
  const [selected, setSelected] = useState<ZipFile | null>(null);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processZip = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setErr("Lütfen .zip dosyası seçin.");
      return;
    }
    setProcessing(true); setErr(null); setZipName(file.name);
    try {
      const zip = new JSZip();
      const z = await zip.loadAsync(file);
      const out: ZipFile[] = [];
      const TEXT_EXTS = new Set(["ts","tsx","js","jsx","json","css","html","md","txt","svg","xml","yaml","yml","env","config","gitignore","lock"]);

      for (const path of Object.keys(z.files)) {
        const entry = z.files[path];
        if (entry.dir) continue;
        const name = path.split("/").pop() || path;
        if (name.startsWith(".") || path.includes("__MACOSX")) continue;
        const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
        const isText = TEXT_EXTS.has(ext) || !ext;
        if (isText) {
          const content = await entry.async("string");
          out.push({ path, name, ext, content, isBinary: false, size: content.length });
        } else {
          const blob = await entry.async("blob");
          out.push({ path, name, ext, content: `[Binary: ${blob.type || ext}]`, isBinary: true, size: blob.size, blobUrl: URL.createObjectURL(blob) });
        }
      }
      out.sort((a, b) => a.path.localeCompare(b.path));
      setFiles(out);
      const first = out.find(f => !f.isBinary);
      if (first) setSelected(first);
    } catch {
      setErr("ZIP dosyası okunurken hata oluştu.");
    } finally {
      setProcessing(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) processZip(f);
  };

  const copyContent = async () => {
    if (!selected || selected.isBinary) return;
    await navigator.clipboard.writeText(selected.content);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const filtered = search
    ? files.filter(f => f.path.toLowerCase().includes(search.toLowerCase()) || (!f.isBinary && f.content.toLowerCase().includes(search.toLowerCase())))
    : files;
  const tree = buildTree(filtered);
  const treeRoots = Object.values(tree.children).sort((a, b) =>
    Number(!b.isDir) - Number(!a.isDir) || a.name.localeCompare(b.name)
  );

  return (
    <div className="flex h-full flex-col text-[12px]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            <FileArchive size={15} />
          </div>
          <div>
            <p className="font-bold text-white/90 text-[13px]">ZIP Dosya Gezgini</p>
            {zipName && <p className="text-[10px] text-white/40 truncate max-w-[180px]">{zipName}</p>}
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition">
          <X size={14} />
        </button>
      </div>

      {files.length === 0 ? (
        /* Upload zone */
        <div
          onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition cursor-pointer p-6 text-center
            ${drag ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 scale-[1.01]" : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"}`}
        >
          <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={e => { if (e.target.files?.[0]) processZip(e.target.files[0]); }} />

          {processing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full border-4 border-[color:var(--accent)] border-t-transparent animate-spin" />
              <p className="text-white/60">ZIP açılıyor...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <FileArchive size={24} />
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                  <Code2 size={24} />
                </span>
              </div>
              <div>
                <p className="font-bold text-white text-[13px]">ZIP Dosyası Yükle</p>
                <p className="mt-1 text-[11px] text-white/45">Sürükle bırak veya tıkla</p>
                <p className="mt-0.5 text-[10px] text-white/30">ts · tsx · js · json · css · html · md</p>
              </div>
              <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <Upload size={13} /> Dosya Seç
              </button>
              {err && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-[10px] text-red-300">
                  <AlertCircle size={12} /> {err}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Explorer */
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Dosya veya kod ara..."
                className="w-full rounded-lg bg-black/40 border border-white/10 py-1.5 pl-7 pr-3 text-[11px] text-white outline-none placeholder:text-white/25 focus:border-[color:var(--accent)]"
              />
            </div>
            <button
              onClick={() => { setFiles([]); setSelected(null); setZipName(null); setSearch(""); }}
              className="rounded-lg bg-white/10 px-2 py-1.5 text-[10px] text-white/60 hover:bg-white/20 transition"
            >
              Yeni
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-[10px] text-white/35 px-1">
            <span className="flex items-center gap-1"><Sparkles size={10} style={{ color: "var(--accent)" }} />{files.length} dosya</span>
            <span>{files.filter(f => !f.isBinary).length} metin</span>
            <span>{files.filter(f => f.isBinary).length} binary</span>
          </div>

          {/* Pane: Tree + Viewer */}
          <div className="flex flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            {/* Tree */}
            <div className="w-[180px] shrink-0 overflow-y-auto border-r border-white/10 p-1.5 scrollbar-thin">
              {treeRoots.map(node => (
                <TreeItem key={node.fullPath} node={node} depth={0} selected={selected?.path ?? null} onSelect={setSelected} />
              ))}
            </div>

            {/* Viewer */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {selected ? (
                <>
                  {/* File bar */}
                  <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon ext={selected.ext} />
                      <span className="truncate text-[10px] font-mono text-white/80">{selected.path}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] text-white/30">{formatBytes(selected.size)}</span>
                      {!selected.isBinary && (
                        <button
                          onClick={copyContent}
                          className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[9px] text-white hover:bg-white/20 transition"
                        >
                          {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          {copied ? "Kopyalandı" : "Kopyala"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-auto p-3 scrollbar-thin">
                    {selected.isBinary ? (
                      <div className="flex h-full items-center justify-center text-white/30">
                        {selected.blobUrl && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(selected.name) ? (
                          <img src={selected.blobUrl} alt={selected.name} className="max-h-full max-w-full rounded-lg object-contain" />
                        ) : selected.blobUrl && /\.(mp4|webm|mov)$/i.test(selected.name) ? (
                          <video src={selected.blobUrl} controls className="max-h-full max-w-full rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Eye size={28} className="mx-auto mb-2 opacity-30" />
                            <p className="text-[11px]">Binary dosya önizlemesi yok</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap break-all font-mono text-[10.5px] leading-relaxed text-white/80 select-text">
                        {selected.content.split("\n").map((line, i) => (
                          <div key={i} className="table-row">
                            <span className="table-cell select-none pr-4 text-right text-[9px] text-white/20 w-7">{i + 1}</span>
                            <span className="table-cell">{line || " "}</span>
                          </div>
                        ))}
                      </pre>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-white/25 text-[11px]">
                  Sol menüden dosya seçin
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
