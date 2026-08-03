import type { VercelRequest, VercelResponse } from "@vercel/node";

export function requireAllowedOrigin(req: VercelRequest, res: VercelResponse): boolean {
  void req;
  void res;
  return true;
}
