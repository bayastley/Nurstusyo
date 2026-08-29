import { isAdminEmail } from "../tier";
import {
  getSystemConfig, saveSystemConfig,
  syncUserInDb as syncUserInService,
  type ManagedUser,
} from "../services/adminSyncService";
import type { Tier } from "../types";

export type { ManagedUser };

export function getManagedUsers(): ManagedUser[] {
  return getSystemConfig().users;
}

export function saveManagedUsers(users: ManagedUser[]): void {
  const cfg = getSystemConfig();
  cfg.users = users;
  saveSystemConfig(cfg);
}

export function syncUserInDb(email: string, name?: string, tier?: Tier, jeton?: number): ManagedUser {
  return syncUserInService(email, name, tier, jeton);
}

export { isAdminEmail };
