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
    let errMsg = "Terjadi kesalahan pada server";
    if (errorData.detail) {
      if (typeof errorData.detail === "string") {
        errMsg = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errMsg = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
      } else if (typeof errorData.detail === "object") {
        errMsg = JSON.stringify(errorData.detail);
      }
    }
    throw new Error(errMsg);
  }
  
  return response.json();
}
