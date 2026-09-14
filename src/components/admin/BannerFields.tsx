"use client";
import { useState } from "react";
import { MediaPicker } from "./MediaPicker";
import { Select } from "@/components/ui/Select";
import type { Banner } from "@/db/schema";

export function BannerFields({ b }: { b?: Banner }) {
  const [image, setImage] = useState<string>(b?.image ?? "/images/hero.jpg");
  return (
    <>
      <input type="hidden" name="id" value={b?.id ?? ""} />
      <input type="hidden" name="image" value={image} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">عنوان *</label><input name="title" required defaultValue={b?.title} className="input" /></div>
        <div className="sm:col-span-2"><label className="label">زیرعنوان</label><input name="subtitle" defaultValue={b?.subtitle ?? ""} className="input" /></div>
        <div className="sm:col-span-2">
          <label className="label">تصویر بنر *</label>
          <MediaPicker value={image} onSelect={setImage} label="انتخاب تصویر بنر" />
        </div>
        <div><label className="label">لینک</label><input name="link" defaultValue={b?.link ?? ""} className="input" dir="ltr" placeholder="/products?sort=discount" /></div>
        <div><label className="label">جایگاه</label><Select name="position" defaultValue={b?.position ?? "hero"} label="جایگاه" options={[{ value: "hero", label: "بنر اصلی (Hero)" }, { value: "side", label: "بنر کناری" }]} /></div>
        <div><label className="label">ترتیب</label><input name="sortOrder" type="number" defaultValue={b?.sortOrder ?? 0} className="input" dir="ltr" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={b?.isActive ?? true} className="accent-brand-600" /> فعال</label>
      </div>
    </>
  );
}
