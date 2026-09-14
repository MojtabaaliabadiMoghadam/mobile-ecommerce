# اکسیر موبایل — فروشگاه اینترنتی موبایل (فروش آنلاین + حضوری)

فروشگاه کامل موبایل با:

- **Frontend:** Next.js 16 (App Router) — SSR کامل برای سئو
- **Backend:** همان‌جا (Route Handlers + Server Actions) — REST API زیر `/api/*`
- **Database:** PostgreSQL + Drizzle ORM
- **UI:** Tailwind CSS v4، راست‌چین (RTL)، حالت Dark/Light، کاملاً Responsive (Mobile-First)

---

## ✨ امکانات اصلی

- **فروشگاه:** صفحه اصلی با بنر و دسته‌ها، لیست محصولات با فیلتر (برند/قیمت/رنگ/حافظه/رم)، صفحه محصول با گالری و انتخاب رنگ/حافظه، سبد خرید، چک‌اوت کامل (آدرس → ارسال → پرداخت)، درگاه زرین‌پال شبیه‌سازی‌شده
- **مقالات (بلاگ):** بخش مقالات با دسته‌بندی، سئو کامل و مدیریت از پنل ادمین
- **دیتای دمو مقالات:** ۱۰ مقاله کامل و آماده (راهنمای خرید، مقایسه، اخبار تکنولوژی) + ۳ دسته + ورودی کتابخانه مدیا، که همراه سایر داده‌ها به‌صورت خودکار seed می‌شوند
- **مدیریت تصاویر:** منیجر آپلود تصویر با حالت گالری (بدون هاردکد کردن آدرس)
- **پنل مشتری:** داشبورد، سفارش‌ها با ردیابی مرحله‌ای، علاقه‌مندی، باشگاه مشتریان (برنزی/نقره‌ای/طلایی)، آدرس‌ها، پروفایل
- **پنل مدیریت:** داشبورد آماری با نمودار، مدیریت محصولات/سفارشات/کاربران/تخفیف‌ها/مقالات/بنرها/درگاه‌ها/تنظیمات، با نقش و سطح دسترسی
- **سئو:** متاتگ داینامیک، JSON-LD (Product/AggregateOffer/Article)، sitemap.xml و robots.txt داینامیک

---

## 🛠 پیش‌نیازها

- Node.js 18/20 یا بالاتر
- PostgreSQL 14+ (یا Docker برای اجرای سریع: `docker compose up`)
- npm

---

## 🚀 اجرای محلی (Local Development)

### ۱) نصب وابستگی‌ها

```bash
npm install
```

### ۲) ساخت دیتابیس PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER app WITH PASSWORD 'your_password';
CREATE DATABASE app_db OWNER app;
GRANT ALL PRIVILEGES ON DATABASE app_db TO app;
\q
```

### ۳) تنظیم فایل محیطی

```bash
cp .env.example .env
nano .env
```

```env
# دیتابیس
DATABASE_URL=postgresql://app:your_password@127.0.0.1:5432/app_db

# کلید امضای سشن (یک رشته تصادفی بلند بسازید)
AUTH_SECRET=my-long-random-secret-string

# آدرس عمومی سایت
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> 💡 برای ساخت `AUTH_SECRET`: `openssl rand -hex 32`

### ۴) ساخت جداول و داده‌های نمونه

```bash
npx drizzle-kit push        # ساخت جداول (migrate)
npm run seed:all            # داده‌های نمونه + کاربر ادمین + مقالات دمو
```

| اسکریپت | کار |
|---|---|
| `npm run seed` | seed کامل: ۲۶ محصول، ۶ برند، ۵ دسته، ۶ کاربر، سفارشات، نظرات، کوپن، بنر، تنظیمات، درگاه‌ها + مقالات |
| `npm run seed:articles` | فقط مقالات دمو بلاگ (۱۰ مقاله کامل + ۳ دسته) — idempotent و بر اساس `slug` تکراری نمی‌سازد |

> برنامه در اولین اجرا اگر دیتابیس خالی باشد به‌صورت خودکار seed می‌کند؛
> اما با `scripts/seed.ts` می‌توانید دستی هم اجرا کنید.

### ۵) اجرا

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔑 اطلاعات ورود (پس از Seed)

| نقش | ایمیل | رمز عبور |
|---|---|---|
| **مدیر کل (Admin)** | `admin@example.com` | `Admin@12345` |
| مدیر فروشگاه (Manager) | `manager@example.com` | `User@12345` |
| مشتری طلایی (Gold) | `ali@example.com` | `User@12345` |
| مشتری نقره‌ای (Silver) | `maryam@example.com` | `User@12345` |

کدهای تخفیف نمونه: `WELCOME10` (۱۰٪)، `SUMMER500` (۵۰۰ هزار تومان)

پنل مدیریت: `/admin` — پنل کاربر: `/account` — مقالات: `/blog`

---

## 📡 اندپوینت‌های API

| Method | Endpoint | توضیح |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | احراز هویت |
| GET | `/api/auth/me` | کاربر فعلی |
| GET | `/api/products` | لیست محصولات با فیلتر |
| GET | `/api/products/[slug]` | جزئیات محصول |
| GET | `/api/search?q=` | جستجوی اتوکامپلیت |
| POST | `/api/coupons/validate` | اعتبارسنجی کد تخفیف |
| GET/POST | `/api/orders` | سفارش‌های کاربر / ثبت سفارش |
| GET | `/api/payment/zarinpal/request` · `/api/payment/zarinpal/verify` | پرداخت (شبیه‌سازی) |
| GET/POST/DELETE | `/api/admin/media*` | مدیریت و آپلود تصاویر |
| GET | `/api/seed` · `/api/health` | seed / سلامت |

---

---

## 🐳 اجرای سریع با Docker (فقط PostgreSQL)

> در نسخه قبلی، `docker-compose.yml` شامل MySQL، phpMyAdmin، بک‌اند لاراول و فرانت‌اند Nuxt بود؛
> آن سرویس‌ها به‌کلی **حذف** شده‌اند. این پروژه یک مونولیت **Next.js + PostgreSQL** است
> (دیتابیس MySQL/phpMyAdmin در آن هیچ کاربردی ندارد).

```bash
docker compose up -d     # postgres + app (اولین اجرا: npm ci → build → drizzle-kit push → seed → start)
docker compose logs -f app
# → http://localhost:3000

# فقط اگر می‌خواهید بدون داکر و با npm run dev روی همین دیتابیس کانتینری کار کنید:
cp .env.docker .env
```

> ⚠️ مرحله `npm run build` داخل ایمیج به `DATABASE_URL` وصل می‌شود (sitemap و کوئری‌های داینامیک هنگام build اجرا می‌شوند)؛
> به همین دلیل build در `docker compose` انجام می‌شود و سرویس `postgres` با alias `db` هم در شبکه در دسترس است.

سرویس‌ها:

| سرویس | نقش | پورت |
|---|---|---|
| `postgres` | PostgreSQL 16 (دیالکت Drizzle پروژه) | 5432 |
| `app` | بیلد و اجرای Next.js (فرانت + API + پنل ادمین) | 3000 |
| `adminer` *(اختیاری)* | ابزار وب مدیریت دیتابیس — جایگزین سازگار با Postgres برای phpMyAdmin | 8081 |
| `seed` *(اختیاری)* | اجرای seed داده‌های نمونه + ۱۰ مقاله دمو (idempotent) | — |

```bash
docker compose --profile admin up -d        # فعال کردن adminer
docker compose run --rm seed                # seed دستی (مثلاً بعد از drop کردن دیتابیس)
docker compose down -v                        # توقف و حذف کامل داده‌ها
```

> در `up` معمولی، seed در `CMD` ایمیج اجرا می‌شود؛ `seed` جدا فقط وقتی لازم است که بخواهید داده‌ها را دوباره بسازید
> (مثلاً برای دمو/ارائه). هر دو مسیر idempotent هستند و داده موجود را خراب نمی‌کنند.

---

## 📝 بخش مقالات (بلاگ)

- مسیرها: `/blog` (لیست + تب دسته‌ها + صفحه‌بندی) و `/blog/[slug]` (نمایش مقاله)
- مدیریت: `/admin/articles` (فهرست) و `/admin/articles/[id]` (فرم ایجاد/ویرایش) — نیازمند سطح دسترسی `content`
- مدل داده: جداول `articles` و `article_categories` با relation، و ایندکس `(is_published, published_at)`
- محتوای دمو آماده: **۱۰ مقاله** با متن بلند و بخش‌بندی‌شده

| عنوان | دسته | slug |
|---|---|---|
| راهنمای جامع خرید گوشی موبایل در سال ۱۴۰۴ | راهنمای خرید | `mobile-buying-guide-1404` |
| چطور بهترین نسبت قیمت به کیفیت را پیدا کنیم | راهنمای خرید | `best-value-phone-budget-guide` |
| مقایسه آیفون ۱۵ پرو مکس با گلکسی S24 اولترا | مقایسه محصولات | `iphone-15-pro-max-vs-galaxy-s24-ultra` |
| مقایسه دوربین گوشی‌های میان‌رده | مقایسه محصولات | `midrange-camera-comparison` |
| ۵ نکته برای افزایش عمر باتری گوشی | راهنمای خرید | `5-tips-battery-life` |
| هوش مصنوعی روی گوشی: چه چیزی واقعاً به درد می‌خورد؟ | اخبار تکنولوژی | `ai-on-mobile-phones` |
| مقایسه پردازنده‌های پرچمدار ۲۰۲۴ | اخبار تکنولوژی | `flagship-soc-comparison-2024` |
| راهنمای رجیستری، گارانتی و آکبند | راهنمای خرید | `registry-warranty-guide-iran` |
| شارژ سریع و سلامت باتری | مقایسه محصولات | `fast-charging-battery-health` |
| باشگاه مشتریان و کدهای تخفیف | راهنمای خرید | `loyalty-and-coupons-guide` |

- لیست مقالات دمو در `src/lib/seed.ts` (آرایه `demoArticles`) نگه داشته می‌شود و تابع `seedDemoArticles()`
  دسته‌ها/مقالاتِ جاافتاده را می‌سازد؛ یعنی روی دیتابیس موجود هم بدون ایجاد داده تکراری کار می‌کند.
- اگر دیتابیس از قبل پر باشد ولی جدول `articles` خالی بماند، برنامه در اولین رندر خودش مقالات دمو را اضافه می‌کند.
- داخل متن مقاله‌ها از هدینگ کوتاه با پیشوند `## ` استفاده شده که در `/blog/[slug]` به‌صورت `<h2>` رندر می‌شود
  (بقیه خطوط، پاراگراف).
- برای افزودن مقاله دمو جدید: فقط یک آبجکت به `demoArticles` اضافه کنید (با `slug` یکتا) و `npm run seed:articles` را بزنید.

---

## 🚀 استقرار روی سرور مجازی (VPS Ubuntu)

راهنمای گام‌به‌گام برای آپلود پروژه روی یک VPS اوبونتو و اختصاص IP (یا دامنه) به آن.

## ۱) آماده‌سازی سرور

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# PM2 (اجرای دائمی)
sudo npm install -g pm2

# Nginx (Proxy + دامنه/IP)
sudo apt install -y nginx
```

## ۲) ساخت دیتابیس روی سرور

```bash
sudo -u postgres psql
```

```sql
CREATE USER elixir WITH PASSWORD 'A_STRONG_PASSWORD';
CREATE DATABASE elixir_mobile OWNER elixir;
GRANT ALL PRIVILEGES ON DATABASE elixir_mobile TO elixir;
\q
```

## ۳) آپلود پروژه به سرور

دو روش — با Git یا با SCP:

```bash
# روش ۱: با Git
cd /var/www
git clone https://your-repo.git elixir-mobile
cd elixir-mobile

# روش ۲: با SCP (از سیستم لوکال خودتان)
# scp -r ./elixir-mobile user@SERVER_IP:/var/www/
```

## ۴) تنظیم محیط و نصب

```bash
cd /var/www/elixir-mobile

cp .env.example .env
nano .env
```

```env
DATABASE_URL=postgresql://elixir:A_STRONG_PASSWORD@127.0.0.1:5432/elixir_mobile
AUTH_SECRET=<خروجی openssl rand -hex 32>
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN_OR_IP
```

```bash
npm install
npx drizzle-kit push
npx tsx scripts/seed.ts
npm run build
```

## ۵) اجرای دائمی با PM2

```bash
pm2 start npm --name "elixir-mobile" -- start
pm2 startup          # اجرای خودکار پس از ریبوت
pm2 save
```

بررسی:

```bash
pm2 status
pm2 logs elixir-mobile
curl http://127.0.0.1:3000/api/health   # باید {"ok":true} برگرداند
```

## ۶) اختصاص IP / دامنه با Nginx

```bash
sudo nano /etc/nginx/sites-available/elixir-mobile
```

```nginx
server {
    listen 80;
    server_name SERVER_IP;   # یا دامنه: shop.example.com

    client_max_body_size 20M;   # برای آپلود تصاویر

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(jpg|jpeg|png|webp|gif|svg|css|js|ico|woff2?)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/elixir-mobile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo ufw allow 'Nginx Full'
```

حالا سایت روی `http://SERVER_IP` در دسترس است.

## ۷) HTTPS با گواهی رایگان (بدون دامنه نیست؛ با دامنه توصیه‌شده)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.example.com
```

بعد از گرفتن گواهی، `NEXT_PUBLIC_SITE_URL` را به `https://...` تغییر دهید و `pm2 restart elixir-mobile` بزنید.

## ۸) پوشه آپلود تصاویر

تصاویر آپلودی در `public/uploads/` ذخیره می‌شوند:

```bash
mkdir -p public/uploads
sudo chown -R $USER:$USER public/uploads
sudo chmod -R 755 public/uploads
```

---

## 📌 دستورات پرکاربرد

| موضوع | دستور |
|---|---|
| لاگ | `pm2 logs elixir-mobile` |
| ری‌استارت | `pm2 restart elixir-mobile` |
| بروزرسانی بعد از تغییر کد | `git pull && npm install && npx drizzle-kit push && npm run build && pm2 restart elixir-mobile` |
| پشتیبان دیتابیس | `pg_dump -U elixir elixir_mobile > backup.sql` |
| بازیابی | `psql -U elixir elixir_mobile < backup.sql` |

---

## 📁 ساختار پروژه

```
src/
├── app/
│   ├── (shop)/            # فروشگاه (خانه، محصولات، دسته‌بندی، سبد، چک‌اوت، مقالات)
│   │   └── account/       # پنل مشتری
│   ├── admin/             # پنل مدیریت
│   ├── api/               # REST API
│   ├── actions/           # Server Actions
│   ├── (shop)/blog/       # لیست مقالات و صفحه مقاله
│   ├── sitemap.ts         # sitemap.xml داینامیک
│   └── robots.ts          # robots.txt
├── components/            # کامپوننت‌های UI و بخش‌های مختلف
├── db/
│   ├── schema.ts          # مدل‌های دیتابیس (Drizzle)
│   └── index.ts           # کلاینت PostgreSQL
├── lib/
│   ├── data.ts            # لایه کوئری
│   ├── auth.ts            # احراز هویت (سشن امضاشده)
│   ├── orders.ts          # منطق سفارش/پرداخت/باشگاه
│   ├── seed.ts            # داده‌های نمونه + مقالات دمو (demoArticles / seedDemoArticles)
│   └── utils.ts           # فرمت تومان/تاریخ شمسی، سطوح باشگاه، برچسب وضعیت‌ها
└── scripts/
    ├── seed.ts            # اجرای seed کامل
    └── seed_articles_once.ts  # فقط مقالات دمو (idempotent)
```
