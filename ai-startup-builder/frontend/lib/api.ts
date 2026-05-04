const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface StartupRequest {
  concept: string;
}

export interface TaskStatus {
  task_id: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE";
  result?: any;
  error?: string;
}

export interface ProjectResponse {
  id: number;
  title: string;
  input_concept: string;
  zip_path?: string;
  created_at: string;
}

/* =========================
   AUTH STORAGE HELPERS
========================= */

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const auth = {
  set(token: string, user: any) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

/* =========================
   API WRAPPER
========================= */

const baseHeaders = () => {
  const user = auth.getUser();

  return {
    "Content-Type": "application/json",
    // backend compatibility (tumhara current system)
    "user-id": user?.id ? String(user.id) : "1",
    // future JWT support
    Authorization: auth.getToken() ? `Bearer ${auth.getToken()}` : "",
  };
};

export const api = {
  /* =========================
     AUTH
  ========================= */

  async signup(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Signup failed");
    }

    return data;
  },

 async login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Login failed");
  }

  return response.json(); // directly user object
},

  async loginWithToken(email: string, password: string) {

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    /**
     * Expected backend response:
     * {
     *   token: "...",
     *   user: { id, email }
     * }
     */
    if (data?.token && data?.user) {
      auth.set(data.token, data.user);
    }

    return data;
  },

  /* =========================
     PROJECTS
  ========================= */

  async generateProject(concept: string): Promise<{ task_id: string }> {
    const res = await fetch(`${API_URL}/projects/generate`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ concept }),
    });

    if (!res.ok) throw new Error("Failed to start generation");
    return res.json();
  },

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const res = await fetch(`${API_URL}/projects/status/${taskId}`, {
      headers: baseHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch task status");
    return res.json();
  },

  async listProjects(): Promise<ProjectResponse[]> {
    const res = await fetch(`${API_URL}/projects/`, {
      headers: baseHeaders(),
    });

    if (!res.ok) throw new Error("Failed to list projects");
    return res.json();
  },

  async downloadProject(projectId: number) {
    const res = await fetch(`${API_URL}/projects/download/${projectId}`, {
      headers: baseHeaders(),
    });

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `startup_${projectId}.zip`;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};