import { getProducts, type ProductFilters } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const arr = (k: string) => sp.getAll(k).flatMap((v) => v.split(",")).filter(Boolean);
  const f: ProductFilters = {
    q: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    brand: arr("brand"),
    color: arr("color"),
    storage: arr("storage"),
    ram: arr("ram"),
    minPrice: Number(sp.get("min")) || undefined,
    maxPrice: Number(sp.get("max")) || undefined,
    inStock: sp.get("inStock") === "1",
    sort: (sp.get("sort") as ProductFilters["sort"]) ?? "newest",
    page: Number(sp.get("page")) || 1,
    perPage: Math.min(48, Number(sp.get("perPage")) || 12),
  };
  const data = await getProducts(f);
  return NextResponse.json(data);
}
