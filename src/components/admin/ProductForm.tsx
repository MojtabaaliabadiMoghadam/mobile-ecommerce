"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { saveProduct, type VariantInput } from "@/app/actions/admin";
import { useToast } from "@/components/ui/Toast";
import { MultiImagePicker } from "./MultiImagePicker";

type P = {
  id?: number; name?: string; slug?: string; sku?: string | null; brandId?: number | null; categoryId?: number | null; shortDescription?: string | null; description?: string | null;
  basePrice?: number; compareAtPrice?: number | null; discountPercent?: number; specs?: Record<string, string>; isFeatured?: boolean; isActive?: boolean; metaTitle?: string | null; metaDescription?: string | null;
  images?: { url: string; alt: string }[]; variants?: VariantInput[];
};

export function ProductForm({ product, brands, categories }: { product: P; brands: { id: number; name: string }[]; categories: { id: number; name: string }[] }) {
  const [variants, setVariants] = useState<VariantInput[]>(product.variants ?? [{ color: "مشکی", colorHex: "#111111", storage: "128GB", ram: "8GB", price: product.basePrice ?? 0, stock: 0 }]);
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const upd = (i: number, k: keyof VariantInput, v: string | number) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const [images, setImages] = useState<{ url: string; alt: string }[]>(product.images ?? []);
  return (
    <form
      className="space-y-5"
      action={(fd) =>
        start(async () => {
          fd.set("variants", JSON.stringify(variants));
          fd.set("images", images.map((i) => `${i.url} | ${i.alt}`).join("\n"));
          const r = await saveProduct(fd);
          if (r.error) return toast(r.error, "error");
          toast("محصول ذخیره شد");
          router.push("/admin/products");
          router.refresh();
        })
      }
    >
      <input type="hidden" name="id" value={product.id ?? ""} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-bold">اطلاعات اصلی</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">نام محصول *</label><input name="name" required defaultValue={product.name} className="input" /></div>
            <div><label className="label">Slug (آدرس سئو)</label><input name="slug" defaultValue={product.slug} className="input" dir="ltr" placeholder="samsung-galaxy-s24" /></div>
            <div><label className="label">SKU</label><input name="sku" defaultValue={product.sku ?? ""} className="input" dir="ltr" /></div>
            <div><label className="label">برند</label><select name="brandId" defaultValue={product.brandId ?? ""} className="input"><option value="">—</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><label className="label">دسته‌بندی</label><select name="categoryId" defaultValue={product.categoryId ?? ""} className="input"><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">قیمت پایه (تومان) *</label><input name="basePrice" type="number" required defaultValue={product.basePrice} className="input" dir="ltr" /></div>
            <div><label className="label">قیمت قبل از تخفیف</label><input name="compareAtPrice" type="number" defaultValue={product.compareAtPrice ?? ""} className="input" dir="ltr" /></div>
            <div><label className="label">درصد تخفیف</label><input name="discountPercent" type="number" min={0} max={90} defaultValue={product.discountPercent ?? 0} className="input" dir="ltr" /></div>
            <div className="sm:col-span-2"><label className="label">توضیح کوتاه</label><input name="shortDescription" defaultValue={product.shortDescription ?? ""} className="input" /></div>
            <div className="sm:col-span-2"><label className="label">توضیحات کامل</label><textarea name="description" rows={6} defaultValue={product.description ?? ""} className="input" /></div>
            <div className="sm:col-span-2"><label className="label">مشخصات فنی (هر خط: کلید: مقدار)</label><textarea name="specs" rows={5} defaultValue={Object.entries(product.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n")} className="input font-mono text-xs" /></div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">انتشار</h2>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={product.isActive ?? true} className="accent-brand-600" /> فعال (نمایش در سایت)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured ?? false} className="accent-brand-600" /> محصول ویژه</label>
          </div>
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">سئو</h2>
            <div><label className="label">Meta Title</label><input name="metaTitle" defaultValue={product.metaTitle ?? ""} className="input" /></div>
            <div><label className="label">Meta Description</label><textarea name="metaDescription" rows={3} defaultValue={product.metaDescription ?? ""} className="input" /></div>
          </div>
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">گالری تصاویر</h2>
            <p className="text-xs text-slate-500">تصاویر را از کتابخانه رسانه انتخاب یا آپلود کنید.</p>
            <MultiImagePicker value={images} onChange={setImages} />
          </div>
        </div>
      </div>
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">تنوع‌ها (رنگ / حافظه / رم / قیمت / موجودی)</h2>
          <button type="button" onClick={() => setVariants((v) => [...v, { color: "", colorHex: "#000000", storage: "128GB", ram: "8GB", price: product.basePrice ?? 0, stock: 0 }])} className="btn-secondary h-8 px-3 text-xs"><Plus className="h-3.5 w-3.5" /> افزودن</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500"><tr><th className="p-2 text-right">رنگ</th><th className="p-2">کد رنگ</th><th className="p-2">حافظه</th><th className="p-2">رم</th><th className="p-2">قیمت</th><th className="p-2">موجودی</th><th></th></tr></thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-1.5"><input value={v.color} onChange={(e) => upd(i, "color", e.target.value)} className="input min-w-28 py-1.5" placeholder="مشکی" /></td>
                  <td className="p-1.5"><input type="color" value={v.colorHex} onChange={(e) => upd(i, "colorHex", e.target.value)} className="h-9 w-12 cursor-pointer rounded border" /></td>
                  <td className="p-1.5"><input value={v.storage} onChange={(e) => upd(i, "storage", e.target.value)} className="input w-24 py-1.5" dir="ltr" /></td>
                  <td className="p-1.5"><input value={v.ram} onChange={(e) => upd(i, "ram", e.target.value)} className="input w-20 py-1.5" dir="ltr" /></td>
                  <td className="p-1.5"><input type="number" value={v.price} onChange={(e) => upd(i, "price", Number(e.target.value))} className="input w-32 py-1.5" dir="ltr" /></td>
                  <td className="p-1.5"><input type="number" value={v.stock} onChange={(e) => upd(i, "stock", Number(e.target.value))} className="input w-20 py-1.5" dir="ltr" /></td>
                  <td className="p-1.5"><button type="button" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} className="btn-ghost h-8 w-8 p-0 text-rose-500"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-2">
        <button disabled={pending} className="btn-primary">{pending ? "در حال ذخیره..." : "ذخیره محصول"}</button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">انصراف</button>
      </div>
    </form>
  );
}
