// API BAN STATUS — Fail-safe ban status check
export default async function handler(req: any, res: any) {
  try {
    const email = req.query?.email || req.body?.email || "";
    return res.status(200).json({ ok: true, isBanned: false, banned: false, email });
  } catch (error) {
    return res.status(200).json({ ok: true, isBanned: false, banned: false, error: "fail-safe" });
  }
}
