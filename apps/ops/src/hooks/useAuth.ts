// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateAuth = async () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/validate", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          // Clear invalid tokens
          localStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Auth validation error:", error);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      setUser(null);
      router.push("/login");
    }
  };

  return { user, loading, logout };
}
