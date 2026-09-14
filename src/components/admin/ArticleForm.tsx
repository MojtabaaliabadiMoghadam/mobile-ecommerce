"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveArticle, deleteArticle } from "@/app/actions/admin";
import { MediaPicker } from "./MediaPicker";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import type { Article, ArticleCategory } from "@/db/schema";

type ArticleWithCat = Article & { category?: ArticleCategory | null };

export function ArticleForm({ categories, article }: { categories: ArticleCategory[]; article?: ArticleWithCat }) {
  const [pending, start] = useTransition();
  const [cover, setCover] = useState(article?.coverImage ?? null);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <form
      className="space-y-5"
      action={(fd) =>
        start(async () => {
          if (cover) fd.set("coverImage", cover);
          const r = await saveArticle(fd);
          if (r.error) return toast(r.error, "error");
          toast("مقاله ذخیره شد");
          router.push("/admin/articles");
          router.refresh();
        })
      }
    >
      <input type="hidden" name="id" value={article?.id ?? ""} />
      <input type="hidden" name="coverImage" value={cover ?? ""} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-bold">محتوا</h2>
          <div>
            <label className="label">عنوان مقاله *</label>
            <input name="title" required defaultValue={article?.title} className="input" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Slug (آدرس سئو)</label>
              <input name="slug" defaultValue={article?.slug} className="input" dir="ltr" placeholder="my-article-slug" />
            </div>
            <div>
              <label className="label">دسته‌بندی</label>
              <Select name="categoryId" defaultValue={String(article?.categoryId ?? "")} label="دسته‌بندی" options={[{ value: "", label: "—" }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]} />
            </div>
          </div>
          <div>
            <label className="label">خلاصه (نمایش در لیست)</label>
            <textarea name="excerpt" rows={2} defaultValue={article?.excerpt ?? ""} className="input" />
          </div>
          <div>
            <label className="label">متن کامل مقاله *</label>
            <textarea name="content" required rows={12} defaultValue={article?.content} className="input leading-7" placeholder="هر پاراگراف را در یک خط بنویسید..." />
          </div>
        </div>

        <div className="space-y-5">
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">تصویر کاور</h2>
            <MediaPicker value={cover} onSelect={setCover} label="انتخاب تصویر کاور" />
            <p className="text-xs text-slate-400">تصویر را از کتابخانه انتخاب یا آپلود کنید.</p>
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="font-bold">انتشار</h2>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked={article?.isPublished ?? false} className="accent-brand-600" /> انتشار مقاله</label>
            <div>
              <label className="label">تاریخ انتشار</label>
              <input name="publishedAt" type="date" defaultValue={article?.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)} className="input" dir="ltr" />
            </div>
            <div>
              <label className="label">نویسنده</label>
              <input name="authorName" defaultValue={article?.authorName ?? "تیم اکسیر موبایل"} className="input" />
            </div>
            <div>
              <label className="label">برچسب‌ها (با کاما جدا کنید)</label>
              <input name="tags" defaultValue={article?.tags?.join("،") ?? ""} className="input" placeholder="راهنما، خرید، گوشی" />
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="font-bold">سئو</h2>
            <div>
              <label className="label">Meta Title</label>
              <input name="metaTitle" defaultValue={article?.metaTitle ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Meta Description</label>
              <textarea name="metaDescription" rows={3} defaultValue={article?.metaDescription ?? ""} className="input" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button disabled={pending} className="btn-primary">{pending ? "در حال ذخیره..." : "ذخیره مقاله"}</button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">انصراف</button>
      </div>
    </form>
  );
}
