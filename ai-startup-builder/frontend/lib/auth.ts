const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const auth = {
  async signup(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Signup failed");
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();

    // ⚡ store token
    localStorage.setItem("token", data.access_token);

    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },
};