import "dotenv/config";
import { db } from "../src/db/index";
import { articleCategories, articles, media } from "../src/db/schema";

async function main() {
  const existing = await db.select({ id: articles.id }).from(articles).limit(1);
  if (existing.length) { console.log("Articles already seeded."); process.exit(0); }

  const cats = await db.insert(articleCategories).values([
    { name: "راهنمای خرید", slug: "buying-guide", sortOrder: 1 },
    { name: "اخبار تکنولوژی", slug: "tech-news", sortOrder: 2 },
    { name: "مقایسه محصولات", slug: "comparison", sortOrder: 3 },
  ]).returning();
  const cm: Record<string, number> = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  const list = [
    { title: "راهنمای خرید گوشی موبایل در سال ۱۴۰۳", slug: "mobile-buying-guide-1403", cat: "buying-guide", img: "/images/phones/iphone-pro.jpg", tags: ["راهنما","خرید"], excerpt: "با این راهنمای جامع، بهترین گوشی متناسب با بودجه و نیاز خود را انتخاب کنید؛ از پرچمدار تا اقتصادی.", body: "انتخاب گوشی مناسب همیشه یکی از چالش‌های اصلی خریداران است.\n\nدر این مقاله ابتدا باید بودجه خود را مشخص کنید؛ سپس به نیازهای اصلی‌تان یعنی دوربین، باتری، صفحه‌نمایش و عملکرد پردازنده توجه کنید." },
    { title: "مقایسه آیفون ۱۵ پرو مکس با گلکسی S24 اولترا", slug: "iphone-15-pro-max-vs-galaxy-s24-ultra", cat: "comparison", img: "/images/phones/galaxy-ultra.jpg", tags: ["مقایسه"], excerpt: "دو پرچمدار بزرگ سال را از نظر دوربین، باتری و عملکرد با هم مقایسه می‌کنیم.", body: "رقابت اپل و سامسونگ در رده پرچمدار همیشه داغ بوده است.\n\nهر دو گوشی در بخش دوربین حرف‌های زیادی برای گفتن دارند اما تفاوت‌های مهمی در تجربه کاربری دارند." },
    { title: "۵ نکته برای افزایش عمر باتری گوشی", slug: "5-tips-battery-life", cat: "buying-guide", img: "/images/phones/pixel.jpg", tags: ["راهنما"], excerpt: "با رعایت این نکات ساده عمر باتری گوشی خود را به‌شکل چشمگیری افزایش دهید.", body: "باتری گوشی پس از مدتی استفاده دچار افت می‌شود.\n\nشارژ هوشمند، اجتناب از گرما و استفاده از شارژر استاندارد از مهم‌ترین نکات هستند." },
    { title: "معرفی سری گلکسی S24 سامسونگ با Galaxy AI", slug: "galaxy-s24-series-review", cat: "tech-news", img: "/images/phones/galaxy-ultra.jpg", tags: ["اخبار"], excerpt: "نسل جدید پرچمدارهای سامسونگ با قابلیت‌های هوش مصنوعی معرفی شد.", body: "سامسونگ امسال تمرکز ویژه‌ای روی هوش مصنوعی داشته است.\n\nقابلیت‌های ترجمه زنده، ویرایش تصویر هوشمند و خلاصه‌سازی یادداشت‌ها از جمله امکانات جدید است." },
    { title: "گوشی‌های تاشو: آینده صنعت موبایل؟", slug: "foldable-phones-future", cat: "tech-news", img: "/images/phones/galaxy-a.jpg", tags: ["اخبار"], excerpt: "بررسی روند رشد گوشی‌های تاشو و پیش‌بینی آینده این دسته از محصولات.", body: "گوشی‌های تاشو از یک نوآوری لوکس به محصولی کاربردی تبدیل شده‌اند.\n\nبا کاهش قیمت و بهبود دوام، این دسته از گوشی‌ها در حال فراگیر شدن هستند." },
    { title: "مقایسه دوربین گوشی‌های میان‌رده ۲۰۲۴", slug: "midrange-camera-comparison-2024", cat: "comparison", img: "/images/phones/redmi.jpg", tags: ["مقایسه"], excerpt: "کدام میان‌رده بهترین دوربین را دارد؟ ردمی، گلکسی A یا پیکسل a؟", body: "دوربین دیگر مخصوص گوشی‌های پرچمدار نیست.\n\nدر این مقایسه گوشی‌های میان‌رده محبوب را از نظر کیفیت عکاسی بررسی می‌کنیم." },
  ];
  const now = Date.now();
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    await db.insert(articles).values({
      title: a.title, slug: a.slug, excerpt: a.excerpt,
      content: a.body + "\n\nبرای مشاهده و خرید جدیدترین گوشی‌های موبایل به فروشگاه اکسیر موبایل مراجعه کنید.",
      coverImage: a.img, categoryId: cm[a.cat], authorName: "تیم اکسیر موبایل",
      tags: a.tags, isPublished: true, viewsCount: (list.length - i) * 47 + 12,
      publishedAt: new Date(now - (list.length - i) * 4 * 24 * 3600 * 1000),
    });
  }
  await db.insert(media).values([
    { filename: "hero.jpg", originalName: "بنر اصلی فروشگاه", mimeType: "image/jpeg", size: 123107, url: "/images/hero.jpg", width: 1536, height: 576, alt: "بنر اصلی اکسیر موبایل" },
    { filename: "iphone-pro.jpg", originalName: "آیفون ۱۵ پرو مکس", mimeType: "image/jpeg", size: 61338, url: "/images/phones/iphone-pro.jpg", width: 1024, height: 1024, alt: "iPhone 15 Pro Max" },
    { filename: "galaxy-ultra.jpg", originalName: "گلکسی S24 اولترا", mimeType: "image/jpeg", size: 53776, url: "/images/phones/galaxy-ultra.jpg", width: 1024, height: 1024, alt: "Galaxy S24 Ultra" },
  ]);
  console.log("✅ Articles and media seeded.");
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
