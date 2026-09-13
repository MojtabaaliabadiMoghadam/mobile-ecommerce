import "dotenv/config";
import { seedDemoArticles, demoArticleCategories } from "../src/lib/seed";

/**
 * seed مقالات دمو (بخش بلاگ).
 *
 * این اسکریپت یک «top-up» امن است:
 *  - اگر هیچ داده‌ای نباشد، `runSeed()` کامل اجرا می‌شود (محصولات + کاربران + مقالات).
 *  - اگر داده‌ها باشد ولی مقالات خالی/کم باشند، فقط مقالات جاافتاده بر اساس slug اضافه می‌شوند.
 *  - اگر همه مقالات موجود باشند، هیچ تغییری داده نمی‌شود (idempotent).
 *
 * اجرا:  npx tsx scripts/seed_articles_once.ts
 */
async function main() {
  const { runSeed, isSeeded } = await import("../src/lib/seed");
  if (!(await isSeeded())) {
    console.log("Database is empty → running full seed (products, users, articles)…");
    await runSeed();
  }

  const { added, total } = await seedDemoArticles();
  if (added === 0) {
    console.log(`✅ Articles already up to date (${total} demo articles in the list).`);
  } else {
    console.log(`✅ Added ${added} article(s) of ${total}. Categories used: ${demoArticleCategories.map((c) => c.name).join("، ")}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
