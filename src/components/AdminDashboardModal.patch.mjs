import { readFileSync, writeFileSync } from "node:fs";

const file = "src/components/AdminDashboardModal.tsx";
let source = readFileSync(file, "utf8");

if (!source.includes('import { AdminBroadcastPanel } from "./AdminBroadcastPanel";')) {
  source = source.replace(
    'import type { Tier } from "../types";',
    'import type { Tier } from "../types";\nimport { AdminBroadcastPanel } from "./AdminBroadcastPanel";',
  );
}

source = source.replace(
  'useState<"users" | "modules" | "sync" | "banLogs">("users")',
  'useState<"users" | "modules" | "sync" | "broadcast" | "banLogs">("users")',
);

source = source
  .replace(/\s*<button\s+onClick=\{\(\) => setActiveTab\("modules"\)\}[\s\S]*?<\/button>/, "")
  .replace(/\s*<button\s+onClick=\{\(\) => setActiveTab\("sync"\)\}[\s\S]*?<\/button>/, "");

if (!source.includes('setActiveTab("broadcast")')) {
  const marker = '<button\n            onClick={() => setActiveTab("banLogs")}';
  const replacement = `<button
            onClick={() => setActiveTab("broadcast")}
            className={\`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[10.5px] font-bold transition whitespace-nowrap \${
              activeTab === "broadcast" ? "text-black font-black" : "text-white/60 hover:text-white"
            }\`}
            style={activeTab === "broadcast" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <Lightbulb size={14} /> Duyuru & Kilitlar
          </button>
          <button
            onClick={() => setActiveTab("banLogs")}`;
  source = source.replace(marker, replacement);
}

if (!source.includes('activeTab === "broadcast" && <AdminBroadcastPanel')) {
  const marker = '          {/* TAB 4: BAN & SİBER DENETİM LOGLARI */}';
  source = source.replace(
    marker,
    `          {activeTab === "broadcast" && <AdminBroadcastPanel notify={notify} />}

${marker}`,
  );
}

writeFileSync(file, source, "utf8");
console.log("AdminDashboardModal.tsx patched safely.");
