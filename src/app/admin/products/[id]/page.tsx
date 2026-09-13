import { notFound, redirect } from "next/navigation";
import { getAdminProduct, getBrands, getCategories } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  if (!hasPermission(await getCurrentUser(), "products")) redirect("/admin");
  const { id } = await params;
  const [brands, categories] = await Promise.all([getBrands(), getCategories()]);
  if (id === "new") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold">محصول جدید</h1>
        <ProductForm product={{}} brands={brands} categories={categories} />
      </div>
    );
  }
  const p = await getAdminProduct(Number(id));
  if (!p) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">ویرایش: {p.name}</h1>
      <ProductForm product={{ ...p, images: p.images.map((i) => ({ url: i.url, alt: i.alt })), variants: p.variants.map((v) => ({ id: v.id, color: v.color, colorHex: v.colorHex, storage: v.storage, ram: v.ram, price: v.price, stock: v.stock })) }} brands={brands} categories={categories} />
    </div>
  );
}
