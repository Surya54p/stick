const API_URL = "http://localhost:8000/api/v1";

export async function apiRequest(path: string, method: string = "GET", body: any = null) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers: any = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config: any = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${path}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Terjadi kesalahan pada server");
  }
  
  return response.json();
}
