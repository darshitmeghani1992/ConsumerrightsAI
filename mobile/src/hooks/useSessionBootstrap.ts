import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/authToken";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/store/session";

export function useSessionBootstrap() {
  const [checking, setChecking] = useState(true);
  const hydrate = useSession((s) => s.hydrate);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token) {
        if (!cancelled) setChecking(false);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) hydrate(me);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await clearToken();
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return checking;
}
