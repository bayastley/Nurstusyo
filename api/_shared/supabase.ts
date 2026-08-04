export async function getUser(_id: string): Promise<any> {
  return null;
}

export async function upsertUser(_user: any): Promise<any> {
  return null;
}

export async function ensureWallet(_userId: string): Promise<any> {
  return null;
}

export async function getWallet(_userId: string): Promise<any> {
  return null;
}

export async function getActiveBan(_userId: string, _email: string): Promise<any> {
  return null;
}

export async function logAdminAction(_data: any): Promise<any> {
  return null;
}

export async function banUserInSupabase(_data: any): Promise<any> {
  return null;
}

export async function unbanUserInSupabase(_email: string): Promise<any> {
  return null;
}

export async function createOrder(_data: any): Promise<any> {
  return null;
}

export async function getOrder(_orderId: string): Promise<any> {
  return null;
}

export async function grantProductToUser(_data: any): Promise<any> {
  return null;
}

export async function spendWallet(_userId: string, _cost: number): Promise<any> {
  return { ok: false, error: "Wallet backend yapılandırılmadı", balance: 0 };
}
