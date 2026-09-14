# =====================================================================
#  اکسیر موبایل — ایمیج تک‌مرحله‌ای برای اجرا با Docker Compose
#  (Next.js 16 + PostgreSQL / Drizzle)
#
#  چرا single-stage؟ چون در اولین اجرای کانتینر به `drizzle-kit` و `tsx`
#  برای ساخت جداول و seed داده‌های نمونه (محصولات + ۱۰ مقاله دمو) نیاز داریم.
#  نکته: `npm run build` به DATABASE_URL نیاز دارد (sitemap/داده‌های داینامیک
#  در زمان بیلد ساخته می‌شوند)، پس build هم باید با شبکه compose انجام شود.
# =====================================================================
FROM node:22-alpine

WORKDIR /app

# ۱) وابستگی‌ها (لایه کش‌شونده؛ devDependencies لازم است: drizzle-kit و tsx)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ۲) سورس و بیلد
COPY . .
RUN npm run build

RUN mkdir -p public/uploads

ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000

# اولین اجرا: ساخت جداول ← seed (اگر خالی باشد) ← اجرای سرور
CMD ["sh", "-c", "npx drizzle-kit push && npx tsx scripts/seed.ts && npx tsx scripts/seed_articles_once.ts && next start -p ${PORT} -H 0.0.0.0"]
