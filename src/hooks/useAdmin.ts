"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken, getIdTokenResult, type User } from "firebase/auth";

type AdminState = { loading: boolean; isAdmin: boolean; user: User | null; error?: string };

const LS_KEY = "CF_IS_ADMIN_V1";
const LS_CHECKED_AT = "CF_ADMIN_CHECKED_AT";
const TTL_MS = 5 * 60 * 1000;

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ loading: true, isAdmin: false, user: null });
  const checkedOnce = useRef(false);

  useEffect(() => {
    const stop = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, isAdmin: false, user: null });
        return;
      }

      // cache to avoid hammering token endpoint
      try {
        const cached = localStorage.getItem(LS_KEY);
        const ts = Number(localStorage.getItem(LS_CHECKED_AT) || 0);
        if (cached !== null && Date.now() - ts < TTL_MS) {
          setState({ loading: false, isAdmin: cached === "1", user });
          return;
        }
      } catch {}

      if (checkedOnce.current) return;
      checkedOnce.current = true;

      const cache = (isAdmin: boolean) => {
        try {
          localStorage.setItem(LS_KEY, isAdmin ? "1" : "0");
          localStorage.setItem(LS_CHECKED_AT, String(Date.now()));
        } catch {}
      };

      let attempts = 0;
      while (attempts < 3) {
        attempts++;
        try {
          const tokenResult = await getIdTokenResult(user, true);
          const admin = Boolean(tokenResult.claims.admin);

          if (!admin) {
            const idToken = await getIdToken(user, true);
            await fetch("/api/auth/ensure-admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            }).catch(() => {});
            const re = await getIdTokenResult(user, true);
            const becameAdmin = Boolean(re.claims.admin);
            cache(becameAdmin);
            setState({ loading: false, isAdmin: becameAdmin, user });
            return;
          } else {
            cache(true);
            setState({ loading: false, isAdmin: true, user });
            return;
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (/quota|400/i.test(msg) && attempts < 3) {
            await new Promise((r) => setTimeout(r, attempts * 500));
            continue;
          }
          cache(false);
          setState({ loading: false, isAdmin: false, user, error: msg });
          return;
        }
      }
    });

    return stop;
  }, []);

  return state;
}
