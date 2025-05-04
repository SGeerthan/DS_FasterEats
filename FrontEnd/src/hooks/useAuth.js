import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);               // NEW

  useEffect(() => {
    /* read saved auth once ---------------------------------------- */
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser =
      localStorage.getItem("user")  || sessionStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);                                        // NEW
  }, []);

  /* ---------------- login ---------------- */
  const login = (jwt, userData, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem("token", jwt);
      localStorage.setItem("user",  JSON.stringify(userData));
    } else {
      sessionStorage.setItem("token", jwt);
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    setToken(jwt);                                            // NEW
    setUser(userData);
    setIsAuthenticated(true);
  };

  /* ---------------- logout ---------------- */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);                                           // NEW
    setUser(null);
    setIsAuthenticated(false);
  };

  /* expose everything --------------------------------------------- */
  return { user, token, isAuthenticated, loading, login, logout };   // NEW values added
};
