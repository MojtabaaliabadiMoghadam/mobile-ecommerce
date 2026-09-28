# Elixir Mobile — Online Mobile Store (Online + In-Store Sales)

A complete mobile phone store with:

* **Frontend:** Next.js 16 (App Router) — Full SSR for SEO
* **Backend:** Built into the same application (Route Handlers + Server Actions) — REST API under `/api/*`
* **Database:** PostgreSQL + Drizzle ORM
* **UI:** Tailwind CSS v4, RTL support, Dark/Light mode, fully Responsive (Mobile-First)

---

## ✨ Main Features

* **Store:** Homepage with banners and categories, product listing with filters (brand/price/color/storage/RAM), product page with gallery and color/storage selection, shopping cart, complete checkout (address → shipping → payment), simulated ZarinPal payment gateway
* **Articles (Blog):** Article section with categories, full SEO support, and management through the admin panel
* **Demo Article Data:** 10 complete and ready-to-use articles (buying guides, comparisons, tech news) + 3 categories + media library entries, automatically seeded along with the other data
* **Image Management:** Image upload manager with gallery mode (no hardcoded image URLs)
* **Customer Panel:** Dashboard, orders with step-by-step tracking, wishlist, loyalty club (Bronze/Silver/Gold), addresses, profile
* **Admin Panel:** Statistical dashboard with charts, management of products/orders/users/discounts/articles/banners/payment gateways/settings, with roles and permission levels
* **SEO:** Dynamic meta tags, JSON-LD (Product/AggregateOffer/Article), dynamic `sitemap.xml` and `robots.txt`

---

## 🛠 Prerequisites

* Node.js 18/20 or higher
* PostgreSQL 14+ (or Docker for quick setup: `docker compose up`)
* npm

---

## 🚀 Local Development

### 1) Install Dependencies

```bash
npm install
```

### 2) Create the PostgreSQL Database

```bash
sudo -u postgres psql
```

```sql
CREATE USER app WITH PASSWORD 'your_password';
CREATE DATABASE app_db OWNER app;
GRANT ALL PRIVILEGES ON DATABASE app_db TO app;
\q
```

### 3) Configure the Environment File

```bash
cp .env.example .env
nano .env
```

```env
# Database
DATABASE_URL=postgresql://app:your_password@127.0.0.1:5432/app_db

# Session signing key (generate a long random string)
AUTH_SECRET=my-long-random-secret-string

# Public site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> 💡 To generate `AUTH_SECRET`:

```bash
openssl rand -hex 32
```

### 4) Create Tables and Seed Demo Data

```bash
npx drizzle-kit push        # Create tables (migrate)
npm run seed:all            # Demo data + admin user + demo articles
```

| Script                  | Description                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run seed`          | Full seed: 26 products, 6 brands, 5 categories, 6 users, orders, reviews, coupons, banners, settings, payment gateways + articles |
| `npm run seed:articles` | Demo blog articles only (10 complete articles + 3 categories) — idempotent and does not create duplicates based on `slug`         |

> The application automatically runs the seed on the first launch if the database is empty.
>
> You can also run it manually using `scripts/seed.ts`.

### 5) Run the Application

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔑 Login Credentials (After Seeding)

| Role            | Email                 | Password      |
| --------------- | --------------------- | ------------- |
| **Super Admin** | `admin@example.com`   | `Admin@12345` |
| Store Manager   | `manager@example.com` | `User@12345`  |
| Gold Customer   | `ali@example.com`     | `User@12345`  |
| Silver Customer | `maryam@example.com`  | `User@12345`  |

Sample discount codes:

* `WELCOME10` — 10%
* `SUMMER500` — 500,000 Tomans

Admin panel: `/admin`
Customer panel: `/account`
Articles: `/blog`

---

## 📡 API Endpoints

| Method          | Endpoint                                                         | Description                  |
| --------------- | ---------------------------------------------------------------- | ---------------------------- |
| POST            | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout`    | Authentication               |
| GET             | `/api/auth/me`                                                   | Current user                 |
| GET             | `/api/products`                                                  | Product list with filters    |
| GET             | `/api/products/[slug]`                                           | Product details              |
| GET             | `/api/search?q=`                                                 | Autocomplete search          |
| POST            | `/api/coupons/validate`                                          | Validate discount code       |
| GET/POST        | `/api/orders`                                                    | User orders / Create order   |
| GET             | `/api/payment/zarinpal/request` · `/api/payment/zarinpal/verify` | Payment (simulated)          |
| GET/POST/DELETE | `/api/admin/media*`                                              | Image management and uploads |
| GET             | `/api/seed` · `/api/health`                                      | Seed / Health check          |

---

## 🐳 Quick Setup with Docker (PostgreSQL Only)

> In the previous version, `docker-compose.yml` included MySQL, phpMyAdmin, a Laravel backend, and a Nuxt frontend.
>
> Those services have been completely **removed**. This project is a **Next.js + PostgreSQL monolith**.
>
> MySQL/phpMyAdmin are not used anywhere in this project.

```bash
docker compose up -d     # postgres + app (first run: npm ci → build → drizzle-kit push → seed → start)
docker compose logs -f app
# → http://localhost:3000

# Only if you want to work without Docker using npm run dev
# with the same containerized database:
cp .env.docker .env
```

> ⚠️ The `npm run build` step inside the image connects to `DATABASE_URL` (dynamic sitemap and queries run during the build).
>
> Therefore, the build is performed inside `docker compose`, and the `postgres` service is available on the network through the `db` alias.

Services:

| Service                | Role                                                                                  | Port |
| ---------------------- | ------------------------------------------------------------------------------------- | ---- |
| `postgres`             | PostgreSQL 16 (Drizzle project dialect)                                               | 5432 |
| `app`                  | Builds and runs Next.js (frontend + API + admin panel)                                | 3000 |
| `adminer` *(optional)* | Web-based database management tool — PostgreSQL-compatible replacement for phpMyAdmin | 8081 |
| `seed` *(optional)*    | Runs sample data + 10 demo articles seed                                              | —    |

```bash
docker compose --profile admin up -d        # Enable Adminer
docker compose run --rm seed                # Manual seed (e.g. after dropping the database)
docker compose down -v                      # Stop and completely remove all data
```

> In the normal `up` flow, the seed runs through the image `CMD`.
>
> The separate `seed` service is only needed when you want to rebuild the demo data, for example for a demo or presentation.
>
> Both approaches are idempotent and do not corrupt existing data.

---

## 📝 Blog / Articles Section

* Routes: `/blog` (list + category tabs + pagination) and `/blog/[slug]` (article page)
* Management: `/admin/articles` (list) and `/admin/articles/[id]` (create/edit form) — requires the `content` permission
* Data model: `articles` and `article_categories` tables with relations, plus an index on `(is_published, published_at)`
* Ready-to-use demo content: **10 long, structured articles**

| Title                                                  | Category           | Slug                                    |
| ------------------------------------------------------ | ------------------ | --------------------------------------- |
| Complete Mobile Phone Buying Guide for 1404            | Buying Guide       | `mobile-buying-guide-1404`              |
| How to Find the Best Price-to-Performance Ratio        | Buying Guide       | `best-value-phone-budget-guide`         |
| iPhone 15 Pro Max vs. Galaxy S24 Ultra Comparison      | Product Comparison | `iphone-15-pro-max-vs-galaxy-s24-ultra` |
| Mid-Range Phone Camera Comparison                      | Product Comparison | `midrange-camera-comparison`            |
| 5 Tips to Extend Your Phone's Battery Life             | Buying Guide       | `5-tips-battery-life`                   |
| AI on Mobile Phones: What Is Actually Useful?          | Tech News          | `ai-on-mobile-phones`                   |
| 2024 Flagship Processor Comparison                     | Tech News          | `flagship-soc-comparison-2024`          |
| Registration, Warranty, and Factory-Sealed Phone Guide | Buying Guide       | `registry-warranty-guide-iran`          |
| Fast Charging and Battery Health                       | Product Comparison | `fast-charging-battery-health`          |
| Loyalty Club and Discount Codes                        | Buying Guide       | `loyalty-and-coupons-guide`             |

* The demo article list is stored in `src/lib/seed.ts` inside the `demoArticles` array, and the `seedDemoArticles()` function creates missing categories/articles. This means it also works safely on an existing database without creating duplicate data.
* If the database is already populated but the `articles` table is empty, the application automatically adds the demo articles during the first render.
* Article content uses short headings with the `## ` prefix, which are rendered as `<h2>` inside `/blog/[slug]`.
* All other lines are rendered as paragraphs.
* To add a new demo article, simply add an object to `demoArticles` with a unique `slug`, then run:

```bash
npm run seed:articles
```

---

## 🚀 Deployment on a VPS (Ubuntu)

Step-by-step instructions for uploading the project to an Ubuntu VPS and assigning an IP address or domain to it.

## 1) Prepare the Server

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# PM2 (process manager)
sudo npm install -g pm2

# Nginx (Proxy + domain/IP)
sudo apt install -y nginx
```

## 2) Create the Database on the Server

```bash
sudo -u postgres psql
```

```sql
CREATE USER elixir WITH PASSWORD 'A_STRONG_PASSWORD';
CREATE DATABASE elixir_mobile OWNER elixir;
GRANT ALL PRIVILEGES ON DATABASE elixir_mobile TO elixir;
\q
```

## 3) Upload the Project to the Server

Two methods are available — Git or SCP:

```bash
# Method 1: Git
cd /var/www
git clone https://your-repo.git elixir-mobile
cd elixir-mobile

# Method 2: SCP (from your local machine)
scp -r ./elixir-mobile user@SERVER_IP:/var/www/
```

## 4) Configure the Environment and Install Dependencies

```bash
cd /var/www/elixir-mobile

cp .env.example .env
nano .env
```

```env
DATABASE_URL=postgresql://elixir:A_STRONG_PASSWORD@127.0.0.1:5432/elixir_mobile
AUTH_SECRET=<output of openssl rand -hex 32>
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN_OR_IP
```

```bash
npm install
npx drizzle-kit push
npx tsx scripts/seed.ts
npm run build
```

## 5) Run the Application Permanently with PM2

```bash
pm2 start npm --name "elixir-mobile" -- start
pm2 startup          # Automatically start after reboot
pm2 save
```

Check the application:

```bash
pm2 status
pm2 logs elixir-mobile
curl http://127.0.0.1:3000/api/health   # Should return {"ok":true}
```

## 6) Assign an IP / Domain with Nginx

```bash
sudo nano /etc/nginx/sites-available/elixir-mobile
```

```nginx
server {
    listen 80;
    server_name SERVER_IP;   # Or domain: shop.example.com

    client_max_body_size 20M;   # For image uploads

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

The website is now available at:

```text
http://SERVER_IP
```

## 7) HTTPS with a Free Certificate

> A domain is required; using HTTPS with a domain is recommended.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.example.com
```

After obtaining the certificate, change `NEXT_PUBLIC_SITE_URL` to `https://...` and restart the application:

```bash
pm2 restart elixir-mobile
```

## 8) Image Upload Directory

Uploaded images are stored in `public/uploads/`:

```bash
mkdir -p public/uploads
sudo chown -R $USER:$USER public/uploads
sudo chmod -R 755 public/uploads
```

---

## 📌 Common Commands

| Purpose                   | Command                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| Logs                      | `pm2 logs elixir-mobile`                                                                        |
| Restart                   | `pm2 restart elixir-mobile`                                                                     |
| Update after code changes | `git pull && npm install && npx drizzle-kit push && npm run build && pm2 restart elixir-mobile` |
| Database backup           | `pg_dump -U elixir elixir_mobile > backup.sql`                                                  |
| Restore                   | `psql -U elixir elixir_mobile < backup.sql`                                                     |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── (shop)/            # Store (home, products, categories, cart, checkout, articles)
│   │   └── account/       # Customer panel
│   ├── admin/             # Admin panel
│   ├── api/               # REST API
│   ├── actions/           # Server Actions
│   ├── (shop)/blog/       # Article list and article page
│   ├── sitemap.ts         # Dynamic sitemap.xml
│   └── robots.ts          # robots.txt
├── components/            # UI components and various sections
├── db/
│   ├── schema.ts          # Database models (Drizzle)
│   └── index.ts           # PostgreSQL client
├── lib/
│   ├── data.ts            # Query layer
│   ├── auth.ts            # Authentication (signed sessions)
│   ├── orders.ts          # Order/payment/loyalty logic
│   ├── seed.ts            # Demo data + demo articles (demoArticles / seedDemoArticles)
│   └── utils.ts           # Toman/date formatting, loyalty tiers, status labels
└── scripts/
    ├── seed.ts            # Full seed execution
    └── seed_articles_once.ts  # Demo articles only (idempotent)
```
