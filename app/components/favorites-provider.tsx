"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type FavoriteKind = "product" | "guide";
type AuthStatus = "loading" | "signed-out" | "signed-in";

type FavoritesContextValue = {
  authStatus: AuthStatus;
  isFavorite: (kind: FavoriteKind, id: string) => boolean;
  isBusy: (kind: FavoriteKind, id: string) => boolean;
  toggle: (kind: FavoriteKind, id: string) => Promise<{ ok: boolean; saved: boolean; requiresSignIn?: boolean }>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(isSupabaseConfigured ? "loading" : "signed-out");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [guideIds, setGuideIds] = useState<string[]>([]);
  const [busyKeys, setBusyKeys] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;
    let active = true;

    async function loadFavorites(currentUser: User | null) {
      if (!active) return;
      if (!currentUser) {
        setAuthStatus("signed-out");
        setProductIds([]);
        setGuideIds([]);
        return;
      }

      setAuthStatus("signed-in");
      const [products, guides] = await Promise.all([
        supabase!.from("product_favorites").select("product_id").eq("user_id", currentUser.id),
        supabase!.from("guide_favorites").select("guide_id").eq("user_id", currentUser.id),
      ]);
      if (!active) return;
      setProductIds(products.data?.map((item) => item.product_id as string) ?? []);
      setGuideIds(guides.data?.map((item) => item.guide_id as string) ?? []);
    }

    supabase.auth.getUser().then(({ data }) => void loadFavorites(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      window.setTimeout(() => void loadFavorites(session?.user ?? null), 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<FavoritesContextValue>(() => ({
    authStatus,
    isFavorite: (kind, id) => (kind === "product" ? productIds : guideIds).includes(id),
    isBusy: (kind, id) => busyKeys.includes(`${kind}:${id}`),
    toggle: async (kind, id) => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return { ok: false, saved: false, requiresSignIn: true };
      const { data: currentUserData, error: userError } = await supabase.auth.getUser();
      const currentUser = currentUserData.user;
      if (userError || !currentUser) {
        setAuthStatus("signed-out");
        setProductIds([]);
        setGuideIds([]);
        return { ok: false, saved: false, requiresSignIn: true };
      }
      const key = `${kind}:${id}`;
      const ids = kind === "product" ? productIds : guideIds;
      const saved = ids.includes(id);
      const table = kind === "product" ? "product_favorites" : "guide_favorites";
      const idColumn = kind === "product" ? "product_id" : "guide_id";
      setBusyKeys((current) => [...current, key]);

      const { error } = saved
        ? await supabase.from(table).delete().eq("user_id", currentUser.id).eq(idColumn, id)
        : await supabase.from(table).insert({ user_id: currentUser.id, [idColumn]: id });

      setBusyKeys((current) => current.filter((item) => item !== key));
      if (error) return { ok: false, saved };
      const update = kind === "product" ? setProductIds : setGuideIds;
      update((current) => saved ? current.filter((item) => item !== id) : [...current, id]);
      if (pathname === "/account") router.refresh();
      return { ok: true, saved: !saved };
    },
  }), [authStatus, busyKeys, guideIds, pathname, productIds, router]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider.");
  return context;
}
