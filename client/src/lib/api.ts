/**
 * API request helper functions for the client-side application
 */

// Same as queryClient fetch, but exported for direct use
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

// Specialized helpers for common operations
export async function fetchAccounts() {
  const res = await apiRequest("GET", "/api/accounts");
  return res.json();
}

export async function fetchFarms() {
  const res = await apiRequest("GET", "/api/farms");
  return res.json();
}

export async function fetchLogs(limit = 100) {
  const res = await apiRequest("GET", `/api/logs?limit=${limit}`);
  return res.json();
}

export async function fetchStats() {
  const res = await apiRequest("GET", "/api/stats");
  return res.json();
}

export async function createAccount(accountData: any) {
  const res = await apiRequest("POST", "/api/accounts", accountData);
  return res.json();
}

export async function createFarm(farmData: any) {
  const res = await apiRequest("POST", "/api/farms", farmData);
  return res.json();
}

export async function updateFarm(id: number, farmData: any) {
  const res = await apiRequest("PATCH", `/api/farms/${id}`, farmData);
  return res.json();
}

export async function deleteFarm(id: number) {
  const res = await apiRequest("DELETE", `/api/farms/${id}`);
  return res.json();
}

export async function login(credentials: { username: string; password: string }) {
  const res = await apiRequest("POST", "/api/auth/login", credentials);
  return res.json();
}

export async function logout() {
  const res = await apiRequest("POST", "/api/auth/logout");
  return res.json();
}

export async function register(userData: { username: string; password: string }) {
  const res = await apiRequest("POST", "/api/auth/register", userData);
  return res.json();
}

export async function getCurrentUser() {
  const res = await apiRequest("GET", "/api/auth/user");
  return res.json();
}
