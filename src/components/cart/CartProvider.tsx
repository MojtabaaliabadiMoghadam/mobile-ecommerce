"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  image: string | null;
  color: string;
  colorHex: string;
  storage: string;
  ram: string;
  price: number;
  qty: number;
  stock: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  update: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "mc_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.variantId === item.variantId);
      if (ex) return prev.map((i) => (i.variantId === item.variantId ? { ...i, qty: Math.min(i.stock, i.qty + qty) } : i));
      return [...prev, { ...item, qty: Math.min(item.stock, qty) }];
    });
  }, []);
  const update = useCallback((variantId: number, qty: number) => {
    setItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) } : i)));
  }, []);
  const remove = useCallback((variantId: number) => setItems((prev) => prev.filter((i) => i.variantId !== variantId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      ready,
      count: items.reduce((a, b) => a + b.qty, 0),
      subtotal: items.reduce((a, b) => a + b.qty * b.price, 0),
      add,
      update,
      remove,
      clear,
    }),
    [items, ready, add, update, remove, clear]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
