import { useCallback } from "react";

export const GUEST_FREE_VIDEOS = 2;

function readGuestUsed(): number {
  try {
    return Number(localStorage.getItem("nur_guest_videos") || 0);
  } catch {
    return 0;
  }
}

function writeGuestUsed(value: number): void {
  try {
    localStorage.setItem("nur_guest_videos", String(value));
  } catch {
    // ignore storage errors
  }
}

export function useGuestTrial(notify: (message: string) => void, setModal: (value: "login" | null) => void) {
  const getGuestUsed = useCallback(() => readGuestUsed(), []);

  const bumpGuestUsed = useCallback(() => {
    writeGuestUsed(readGuestUsed() + 1);
  }, []);

  const handleGuestContinue = useCallback(() => {
    const used = readGuestUsed();
    const left = Math.max(0, GUEST_FREE_VIDEOS - used);
    if (left <= 0) {
      notify("🎁 Misafir deneme hakkın doldu · Google ile 3 saniyede ücretsiz üye ol");
      return;
    }
    setModal(null);
    notify(`👋 Misafir modundasın · ${left} deneme videosu hakkın var · indirmek için üyelik gerekir`);
  }, [notify, setModal]);

  return { getGuestUsed, bumpGuestUsed, handleGuestContinue };
}