import { Component, type ErrorInfo, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════
// ErrorBoundary — React güvenlik ağı.
// Bir bileşen patlarsa TÜM SITE beyaz ekran olmaz; sadece
// sarılmış bölge "Bir sorun oluştu" gösterir, gerisi çalışır.
// ═══════════════════════════════════════════════════════════

type Props = { children: ReactNode; label?: string };
type State = { hata: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hata: null };

  static getDerivedStateFromError(hata: Error): State {
    return { hata };
  }

  componentDidCatch(hata: Error, bilgi: ErrorInfo) {
    // Konsola yaz — ileride bir hata toplama servisine bağlanabilir
    console.error(`[NurStudyo] ${this.props.label ?? "Bileşen"} hatası:`, hata, bilgi.componentStack);
  }

  render() {
    if (this.state.hata) {
      return (
        <div className="m-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-sm font-bold text-red-200">⚠️ {this.props.label ?? "Bu bölüm"} geçici bir sorun yaşadı</p>
          <p className="mt-1 text-[11px] text-white/50">Diğer bölümler çalışmaya devam ediyor.</p>
          <button
            onClick={() => this.setState({ hata: null })}
            className="mt-2 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-white/20 transition"
          >
            ↻ Tekrar dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
