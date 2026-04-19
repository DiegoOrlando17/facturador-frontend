import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from "@/lib/authStorage";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginResponse = {
  token: string;
  adminUser: AuthUser;
};

type AuthContextValue = {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void bootstrapSession();
  }, []);

  async function bootstrapSession() {
    const storedAuth = readStoredAuth();

    if (!storedAuth?.token) {
      setIsBootstrapping(false);
      return;
    }

    try {
      const adminUser = await apiRequest<AuthUser>("/admin/me", {
        token: storedAuth.token,
      });

      setToken(storedAuth.token);
      setUser(adminUser);
    } catch {
      clearStoredAuth();
      setToken(null);
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isBootstrapping,
      isAuthenticated: user !== null,
      token,
      user,
      async login({ email, password, remember }) {
        if (!email || !password) {
          return {
            ok: false,
            message: "Completa email y contrasena.",
          };
        }

        try {
          const response = await apiRequest<LoginResponse>("/admin/auth/login", {
            method: "POST",
            body: {
              email: email.trim().toLowerCase(),
              password,
            },
          });

          setToken(response.token);
          setUser(response.adminUser);
          writeStoredAuth({
            token: response.token,
            remember,
          });

          return { ok: true };
        } catch (error) {
          if (error instanceof ApiError) {
            return {
              ok: false,
              message: error.message,
            };
          }

          return {
            ok: false,
            message: "No se pudo iniciar sesion.",
          };
        }
      },
      logout() {
        if (token) {
          void apiRequest("/admin/auth/logout", {
            method: "POST",
            token,
          }).catch(() => null);
        }

        clearStoredAuth();
        setToken(null);
        setUser(null);
      },
      async refreshSession() {
        if (!token) {
          return;
        }

        try {
          const adminUser = await apiRequest<AuthUser>("/admin/me", { token });
          setUser(adminUser);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            clearStoredAuth();
            setToken(null);
            setUser(null);
          }
        }
      },
    }),
    [isBootstrapping, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
