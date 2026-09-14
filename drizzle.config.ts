import { defineConfig } from "drizzle-kit";

/**
 * تنظیمات Drizzle Kit.
 * آدرس دیتابیس از محیط خوانده می‌شود تا با اجرای لوکال و Docker هر دو کار کند:
 *   • لوکال:  postgresql://app:app_password@127.0.0.1:5432/app_db   (یا پورت داکر)
 *   • داکر:   postgresql://app:app_password@postgres:5432/app_db
 * اگر DATABASE_URL ست نشده باشد، مقدار پیش‌فرض لوکال استفاده می‌شود.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://app:app_password@127.0.0.1:5432/app_db",
  },
});
