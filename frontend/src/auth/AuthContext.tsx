import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { login as apiLogin, fetchMe, UserOut } from "@/api/auth";
import { setAccessToken, setRefreshToken, getRefreshToken } from "@/api/client";

interface AuthContextValue {
  user: UserOut | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserOut>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load, if a refresh token exists, the axios interceptor will use
  // it automatically the first time a protected request 401s. We eagerly
  // try /me here so the user doesn't see a login flash if already logged in.
  useEffect(() => {
    if (!getRefreshToken()) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

    const login = async (email: string, password: string): Promise<UserOut> => {
    const tokens = await apiLogin(email, password);
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    const me = await fetchMe();
    setUser(me);
    return me;
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}