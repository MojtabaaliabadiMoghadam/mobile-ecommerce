import { db } from "@/db";
import {
  users,
  brands,
  categories,
  products,
  productImages,
  productVariants,
  reviews,
  addresses,
  coupons,
  orders,
  orderItems,
  orderStatusHistory,
  loyaltyTransactions,
  banners,
  pages,
  settings,
  paymentGateways,
  wishlists,
  articles,
  articleCategories,
  media,
} from "@/db/schema";
import { hashPassword } from "./auth";
import { sql } from "drizzle-orm";

export const ADMIN_EMAIL = "admin@example.com";
export const ADMIN_PASSWORD = "Admin@12345";

type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  category: string;
  image: string;
  basePrice: number;
  discount?: number;
  featured?: boolean;
  sales: number;
  short: string;
  specs: Record<string, string>;
  colors: { name: string; hex: string }[];
  configs: { storage: string; ram: string; extra: number }[];
  stock: number;
};

const P = (o: SeedProduct) => o;
const IMG = "/images/phones/";

const seedProducts: SeedProduct[] = [
  P({
    name: "گوشی اپل iPhone 15 Pro Max",
    slug: "apple-iphone-15-pro-max",
    brand: "apple",
    category: "flagship",
    image: IMG + "iphone-pro.jpg",
    basePrice: 78900000,
    featured: true,
    sales: 320,
    short: "پرچمدار اپل با بدنه تیتانیومی، تراشه A17 Pro و دوربین ۴۸ مگاپیکسلی با زوم ۵ برابر",
    specs: { "صفحه‌نمایش": "6.7 اینچ Super Retina XDR", "تراشه": "A17 Pro", "دوربین اصلی": "48+12+12 مگاپیکسل", "باتری": "4441 میلی‌آمپر", "سیستم‌عامل": "iOS 17", "شبکه": "5G" },
    colors: [
      { name: "تیتانیوم طبیعی", hex: "#b8b3aa" },
      { name: "تیتانیوم مشکی", hex: "#2b2b2d" },
      { name: "تیتانیوم آبی", hex: "#3b4a5c" },
    ],
    configs: [
      { storage: "256GB", ram: "8GB", extra: 0 },
      { storage: "512GB", ram: "8GB", extra: 9000000 },
      { storage: "1TB", ram: "8GB", extra: 19000000 },
    ],
    stock: 12,
  }),
  P({
    name: "گوشی اپل iPhone 15 Pro",
    slug: "apple-iphone-15-pro",
    brand: "apple",
    category: "flagship",
    image: IMG + "iphone-pro.jpg",
    basePrice: 66500000,
    discount: 5,
    featured: true,
    sales: 210,
    short: "آیفون ۱۵ پرو با قاب تیتانیومی، دکمه اکشن و پورت USB-C",
    specs: { "صفحه‌نمایش": "6.1 اینچ Super Retina XDR", "تراشه": "A17 Pro", "دوربین اصلی": "48+12+12 مگاپیکسل", "باتری": "3274 میلی‌آمپر", "سیستم‌عامل": "iOS 17", "شبکه": "5G" },
    colors: [
      { name: "تیتانیوم طبیعی", hex: "#b8b3aa" },
      { name: "تیتانیوم سفید", hex: "#e8e6e1" },
    ],
    configs: [
      { storage: "128GB", ram: "8GB", extra: 0 },
      { storage: "256GB", ram: "8GB", extra: 6000000 },
    ],
    stock: 8,
  }),
  P({
    name: "گوشی اپل iPhone 15",
    slug: "apple-iphone-15",
    brand: "apple",
    category: "flagship",
    image: IMG + "iphone-standard.jpg",
    basePrice: 49800000,
    sales: 280,
    short: "آیفون ۱۵ با داینامیک آیلند، دوربین ۴۸ مگاپیکسلی و USB-C",
    specs: { "صفحه‌نمایش": "6.1 اینچ OLED", "تراشه": "A16 Bionic", "دوربین اصلی": "48+12 مگاپیکسل", "باتری": "3349 میلی‌آمپر", "سیستم‌عامل": "iOS 17", "شبکه": "5G" },
    colors: [
      { name: "آبی", hex: "#a9c7de" },
      { name: "صورتی", hex: "#f2c9d1" },
      { name: "مشکی", hex: "#2f3133" },
      { name: "زرد", hex: "#f3e6a2" },
    ],
    configs: [
      { storage: "128GB", ram: "6GB", extra: 0 },
      { storage: "256GB", ram: "6GB", extra: 5500000 },
    ],
    stock: 20,
  }),
  P({
    name: "گوشی اپل iPhone 14",
    slug: "apple-iphone-14",
    brand: "apple",
    category: "flagship",
    image: IMG + "iphone-standard.jpg",
    basePrice: 41200000,
    discount: 8,
    sales: 150,
    short: "آیفون ۱۴ با تراشه A15 و دوربین دوگانه ۱۲ مگاپیکسلی",
    specs: { "صفحه‌نمایش": "6.1 اینچ OLED", "تراشه": "A15 Bionic", "دوربین اصلی": "12+12 مگاپیکسل", "باتری": "3279 میلی‌آمپر", "سیستم‌عامل": "iOS 16", "شبکه": "5G" },
    colors: [
      { name: "آبی", hex: "#a7bfd4" },
      { name: "بنفش", hex: "#d6c8e2" },
      { name: "مشکی", hex: "#2f3133" },
    ],
    configs: [{ storage: "128GB", ram: "6GB", extra: 0 }],
    stock: 5,
  }),
  P({
    name: "گوشی اپل iPhone 13",
    slug: "apple-iphone-13",
    brand: "apple",
    category: "flagship",
    image: IMG + "iphone-standard.jpg",
    basePrice: 35900000,
    sales: 190,
    short: "آیفون ۱۳؛ انتخابی اقتصادی برای ورود به اکوسیستم اپل",
    specs: { "صفحه‌نمایش": "6.1 اینچ OLED", "تراشه": "A15 Bionic", "دوربین اصلی": "12+12 مگاپیکسل", "باتری": "3240 میلی‌آمپر", "سیستم‌عامل": "iOS 15", "شبکه": "5G" },
    colors: [
      { name: "میدنایت", hex: "#232a31" },
      { name: "استارلایت", hex: "#f0ebe1" },
    ],
    configs: [{ storage: "128GB", ram: "4GB", extra: 0 }],
    stock: 0,
  }),
  P({
    name: "گوشی سامسونگ Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    brand: "samsung",
    category: "flagship",
    image: IMG + "galaxy-ultra.jpg",
    basePrice: 72400000,
    featured: true,
    sales: 410,
    short: "پرچمدار سامسونگ با قاب تیتانیومی، قلم S Pen، دوربین ۲۰۰ مگاپیکسلی و هوش مصنوعی Galaxy AI",
    specs: { "صفحه‌نمایش": "6.8 اینچ Dynamic AMOLED 2X", "تراشه": "Snapdragon 8 Gen 3", "دوربین اصلی": "200+50+12+10 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14 / One UI 6.1", "شبکه": "5G" },
    colors: [
      { name: "خاکستری تیتانیوم", hex: "#8a8d90" },
      { name: "مشکی تیتانیوم", hex: "#2a2a2c" },
      { name: "بنفش تیتانیوم", hex: "#8f8aa8" },
    ],
    configs: [
      { storage: "256GB", ram: "12GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 7000000 },
    ],
    stock: 15,
  }),
  P({
    name: "گوشی سامسونگ Galaxy S24 Plus",
    slug: "samsung-galaxy-s24-plus",
    brand: "samsung",
    category: "flagship",
    image: IMG + "galaxy-ultra.jpg",
    basePrice: 54800000,
    discount: 6,
    sales: 120,
    short: "نمایشگر ۶.۷ اینچی QHD+، تراشه Exynos 2400 و باتری ۴۹۰۰ میلی‌آمپری",
    specs: { "صفحه‌نمایش": "6.7 اینچ Dynamic AMOLED 2X", "تراشه": "Exynos 2400", "دوربین اصلی": "50+12+10 مگاپیکسل", "باتری": "4900 میلی‌آمپر", "سیستم‌عامل": "Android 14", "شبکه": "5G" },
    colors: [
      { name: "مشکی اونیکس", hex: "#222" },
      { name: "بنفش کبالت", hex: "#7c7fb3" },
    ],
    configs: [
      { storage: "256GB", ram: "12GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 6000000 },
    ],
    stock: 9,
  }),
  P({
    name: "گوشی سامسونگ Galaxy S23 FE",
    slug: "samsung-galaxy-s23-fe",
    brand: "samsung",
    category: "flagship",
    image: IMG + "galaxy-ultra.jpg",
    basePrice: 29900000,
    discount: 10,
    sales: 260,
    short: "نسخه اقتصادی سری S با دوربین ۵۰ مگاپیکسلی و نمایشگر ۱۲۰ هرتز",
    specs: { "صفحه‌نمایش": "6.4 اینچ Dynamic AMOLED 2X", "تراشه": "Exynos 2200", "دوربین اصلی": "50+12+8 مگاپیکسل", "باتری": "4500 میلی‌آمپر", "سیستم‌عامل": "Android 13", "شبکه": "5G" },
    colors: [
      { name: "نعنایی", hex: "#b9d8c9" },
      { name: "گرافیت", hex: "#3d3f42" },
      { name: "کرم", hex: "#efe4d2" },
    ],
    configs: [
      { storage: "128GB", ram: "8GB", extra: 0 },
      { storage: "256GB", ram: "8GB", extra: 3000000 },
    ],
    stock: 18,
  }),
  P({
    name: "گوشی سامسونگ Galaxy A55",
    slug: "samsung-galaxy-a55",
    brand: "samsung",
    category: "midrange",
    image: IMG + "galaxy-a.jpg",
    basePrice: 21500000,
    featured: true,
    sales: 530,
    short: "میان‌رده محبوب سامسونگ با قاب فلزی، نمایشگر ۱۲۰ هرتز و مقاومت IP67",
    specs: { "صفحه‌نمایش": "6.6 اینچ Super AMOLED", "تراشه": "Exynos 1480", "دوربین اصلی": "50+12+5 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14", "شبکه": "5G" },
    colors: [
      { name: "یاسی", hex: "#c9b8e6" },
      { name: "آبی یخی", hex: "#c4dcec" },
      { name: "مشکی", hex: "#1f1f24" },
    ],
    configs: [
      { storage: "128GB", ram: "8GB", extra: 0 },
      { storage: "256GB", ram: "8GB", extra: 2000000 },
      { storage: "256GB", ram: "12GB", extra: 3500000 },
    ],
    stock: 40,
  }),
  P({
    name: "گوشی سامسونگ Galaxy A35",
    slug: "samsung-galaxy-a35",
    brand: "samsung",
    category: "midrange",
    image: IMG + "galaxy-a.jpg",
    basePrice: 16800000,
    discount: 7,
    sales: 470,
    short: "میان‌رده اقتصادی با نمایشگر Super AMOLED و باتری ۵۰۰۰ میلی‌آمپری",
    specs: { "صفحه‌نمایش": "6.6 اینچ Super AMOLED", "تراشه": "Exynos 1380", "دوربین اصلی": "50+8+5 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14", "شبکه": "5G" },
    colors: [
      { name: "یاسی", hex: "#c9b8e6" },
      { name: "سرمه‌ای", hex: "#2f3b5c" },
    ],
    configs: [
      { storage: "128GB", ram: "6GB", extra: 0 },
      { storage: "256GB", ram: "8GB", extra: 2500000 },
    ],
    stock: 35,
  }),
  P({
    name: "گوشی سامسونگ Galaxy A15",
    slug: "samsung-galaxy-a15",
    brand: "samsung",
    category: "budget",
    image: IMG + "galaxy-a.jpg",
    basePrice: 9200000,
    sales: 620,
    short: "گوشی اقتصادی سامسونگ با نمایشگر AMOLED و ۴ سال آپدیت اندروید",
    specs: { "صفحه‌نمایش": "6.5 اینچ Super AMOLED", "تراشه": "Helio G99", "دوربین اصلی": "50+5+2 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14", "شبکه": "4G" },
    colors: [
      { name: "آبی", hex: "#5b7fcf" },
      { name: "مشکی", hex: "#202020" },
      { name: "زرد", hex: "#f2d75c" },
    ],
    configs: [
      { storage: "128GB", ram: "4GB", extra: 0 },
      { storage: "128GB", ram: "6GB", extra: 800000 },
      { storage: "256GB", ram: "8GB", extra: 1900000 },
    ],
    stock: 60,
  }),
  P({
    name: "گوشی سامسونگ Galaxy Z Flip5",
    slug: "samsung-galaxy-z-flip5",
    brand: "samsung",
    category: "foldable",
    image: IMG + "galaxy-ultra.jpg",
    basePrice: 47500000,
    discount: 12,
    sales: 60,
    short: "گوشی تاشو با نمایشگر خارجی ۳.۴ اینچی Flex Window",
    specs: { "صفحه‌نمایش": "6.7 اینچ تاشو + 3.4 اینچ خارجی", "تراشه": "Snapdragon 8 Gen 2", "دوربین اصلی": "12+12 مگاپیکسل", "باتری": "3700 میلی‌آمپر", "سیستم‌عامل": "Android 13", "شبکه": "5G" },
    colors: [
      { name: "نعنایی", hex: "#b9dcc7" },
      { name: "گرافیت", hex: "#3b3b3b" },
      { name: "یاسی", hex: "#d1c2e8" },
    ],
    configs: [
      { storage: "256GB", ram: "8GB", extra: 0 },
      { storage: "512GB", ram: "8GB", extra: 5000000 },
    ],
    stock: 6,
  }),
  P({
    name: "گوشی سامسونگ Galaxy Z Fold5",
    slug: "samsung-galaxy-z-fold5",
    brand: "samsung",
    category: "foldable",
    image: IMG + "galaxy-ultra.jpg",
    basePrice: 89900000,
    sales: 25,
    short: "تبلت-گوشی تاشو با نمایشگر ۷.۶ اینچی و پشتیبانی از S Pen",
    specs: { "صفحه‌نمایش": "7.6 اینچ تاشو + 6.2 اینچ خارجی", "تراشه": "Snapdragon 8 Gen 2", "دوربین اصلی": "50+12+10 مگاپیکسل", "باتری": "4400 میلی‌آمپر", "سیستم‌عامل": "Android 13", "شبکه": "5G" },
    colors: [
      { name: "آبی یخی", hex: "#c8d9e6" },
      { name: "مشکی فانتوم", hex: "#1e1e1e" },
    ],
    configs: [
      { storage: "256GB", ram: "12GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 8000000 },
    ],
    stock: 3,
  }),
  P({
    name: "گوشی شیائومی Xiaomi 14",
    slug: "xiaomi-14",
    brand: "xiaomi",
    category: "flagship",
    image: IMG + "xiaomi-flagship.jpg",
    basePrice: 43900000,
    featured: true,
    sales: 180,
    short: "پرچمدار جمع‌وجور شیائومی با دوربین لایکا و Snapdragon 8 Gen 3",
    specs: { "صفحه‌نمایش": "6.36 اینچ LTPO AMOLED", "تراشه": "Snapdragon 8 Gen 3", "دوربین اصلی": "50+50+50 مگاپیکسل Leica", "باتری": "4610 میلی‌آمپر", "سیستم‌عامل": "Android 14 / HyperOS", "شبکه": "5G" },
    colors: [
      { name: "مشکی", hex: "#141414" },
      { name: "سفید", hex: "#f3f3f3" },
      { name: "سبز", hex: "#5f8a6e" },
    ],
    configs: [
      { storage: "256GB", ram: "12GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 4000000 },
    ],
    stock: 11,
  }),
  P({
    name: "گوشی شیائومی Xiaomi 14 Ultra",
    slug: "xiaomi-14-ultra",
    brand: "xiaomi",
    category: "flagship",
    image: IMG + "xiaomi-flagship.jpg",
    basePrice: 64900000,
    sales: 70,
    short: "دوربین ۱ اینچی لایکا با دیافراگم متغیر؛ بهترین گوشی عکاسی شیائومی",
    specs: { "صفحه‌نمایش": "6.73 اینچ LTPO AMOLED", "تراشه": "Snapdragon 8 Gen 3", "دوربین اصلی": "50+50+50+50 مگاپیکسل Leica", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14 / HyperOS", "شبکه": "5G" },
    colors: [
      { name: "مشکی", hex: "#141414" },
      { name: "سفید", hex: "#f3f3f3" },
    ],
    configs: [{ storage: "512GB", ram: "16GB", extra: 0 }],
    stock: 4,
  }),
  P({
    name: "گوشی شیائومی Redmi Note 13 Pro Plus",
    slug: "xiaomi-redmi-note-13-pro-plus",
    brand: "xiaomi",
    category: "midrange",
    image: IMG + "redmi.jpg",
    basePrice: 19800000,
    discount: 9,
    featured: true,
    sales: 590,
    short: "دوربین ۲۰۰ مگاپیکسلی، شارژ ۱۲۰ واتی و نمایشگر خمیده ۱.۵K",
    specs: { "صفحه‌نمایش": "6.67 اینچ AMOLED 1.5K", "تراشه": "Dimensity 7200 Ultra", "دوربین اصلی": "200+8+2 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 13 / MIUI 14", "شبکه": "5G" },
    colors: [
      { name: "مشکی", hex: "#1a1a1a" },
      { name: "بنفش", hex: "#8f7bb5" },
      { name: "سفید", hex: "#f0f0f0" },
    ],
    configs: [
      { storage: "256GB", ram: "8GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 2500000 },
    ],
    stock: 25,
  }),
  P({
    name: "گوشی شیائومی Redmi Note 13 Pro",
    slug: "xiaomi-redmi-note-13-pro",
    brand: "xiaomi",
    category: "midrange",
    image: IMG + "redmi.jpg",
    basePrice: 15900000,
    sales: 710,
    short: "پرفروش‌ترین میان‌رده با دوربین ۲۰۰ مگاپیکسلی و شارژ ۶۷ واتی",
    specs: { "صفحه‌نمایش": "6.67 اینچ AMOLED", "تراشه": "Snapdragon 7s Gen 2", "دوربین اصلی": "200+8+2 مگاپیکسل", "باتری": "5100 میلی‌آمپر", "سیستم‌عامل": "Android 13", "شبکه": "5G" },
    colors: [
      { name: "مشکی", hex: "#1a1a1a" },
      { name: "بنفش", hex: "#8f7bb5" },
      { name: "سبز", hex: "#a6d1b6" },
    ],
    configs: [
      { storage: "256GB", ram: "8GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 2200000 },
    ],
    stock: 30,
  }),
  P({
    name: "گوشی شیائومی Redmi Note 13",
    slug: "xiaomi-redmi-note-13",
    brand: "xiaomi",
    category: "budget",
    image: IMG + "redmi.jpg",
    basePrice: 10900000,
    discount: 5,
    sales: 830,
    short: "نمایشگر AMOLED ۱۲۰ هرتز و دوربین ۱۰۸ مگاپیکسلی با قیمت اقتصادی",
    specs: { "صفحه‌نمایش": "6.67 اینچ AMOLED", "تراشه": "Snapdragon 685", "دوربین اصلی": "108+8+2 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 13", "شبکه": "4G" },
    colors: [
      { name: "مشکی", hex: "#1a1a1a" },
      { name: "سبز نعنایی", hex: "#a6d1b6" },
      { name: "آبی", hex: "#6f9fd8" },
    ],
    configs: [
      { storage: "128GB", ram: "6GB", extra: 0 },
      { storage: "256GB", ram: "8GB", extra: 1500000 },
    ],
    stock: 55,
  }),
  P({
    name: "گوشی شیائومی Redmi 13C",
    slug: "xiaomi-redmi-13c",
    brand: "xiaomi",
    category: "budget",
    image: IMG + "redmi.jpg",
    basePrice: 6900000,
    sales: 940,
    short: "ارزان‌ترین گوشی شیائومی با باتری بزرگ و نمایشگر ۹۰ هرتز",
    specs: { "صفحه‌نمایش": "6.74 اینچ IPS LCD", "تراشه": "Helio G85", "دوربین اصلی": "50+2 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 13", "شبکه": "4G" },
    colors: [
      { name: "مشکی", hex: "#1a1a1a" },
      { name: "سبز", hex: "#9fc7a9" },
      { name: "آبی", hex: "#7fa8e0" },
    ],
    configs: [
      { storage: "128GB", ram: "4GB", extra: 0 },
      { storage: "256GB", ram: "8GB", extra: 1300000 },
    ],
    stock: 80,
  }),
  P({
    name: "گوشی شیائومی Poco X6 Pro",
    slug: "xiaomi-poco-x6-pro",
    brand: "xiaomi",
    category: "gaming",
    image: IMG + "xiaomi-flagship.jpg",
    basePrice: 18900000,
    discount: 6,
    sales: 340,
    short: "پرچمدار کش گیمینگ با Dimensity 8300 Ultra و نمایشگر ۱.۵K",
    specs: { "صفحه‌نمایش": "6.67 اینچ AMOLED 1.5K", "تراشه": "Dimensity 8300 Ultra", "دوربین اصلی": "64+8+2 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14 / HyperOS", "شبکه": "5G" },
    colors: [
      { name: "زرد", hex: "#f2c94c" },
      { name: "مشکی", hex: "#1a1a1a" },
      { name: "خاکستری", hex: "#8a8a8a" },
    ],
    configs: [
      { storage: "256GB", ram: "8GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 2500000 },
    ],
    stock: 22,
  }),
  P({
    name: "گوشی شیائومی Poco F6",
    slug: "xiaomi-poco-f6",
    brand: "xiaomi",
    category: "gaming",
    image: IMG + "xiaomi-flagship.jpg",
    basePrice: 24500000,
    sales: 160,
    short: "Snapdragon 8s Gen 3 با شارژ ۹۰ واتی برای گیمرها",
    specs: { "صفحه‌نمایش": "6.67 اینچ AMOLED 1.5K", "تراشه": "Snapdragon 8s Gen 3", "دوربین اصلی": "50+8 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14 / HyperOS", "شبکه": "5G" },
    colors: [
      { name: "مشکی", hex: "#1a1a1a" },
      { name: "سبز", hex: "#5d9d7a" },
      { name: "تیتانیوم", hex: "#b1b1b1" },
    ],
    configs: [
      { storage: "256GB", ram: "8GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 3000000 },
    ],
    stock: 14,
  }),
  P({
    name: "گوشی گوگل Pixel 8 Pro",
    slug: "google-pixel-8-pro",
    brand: "google",
    category: "flagship",
    image: IMG + "pixel.jpg",
    basePrice: 55900000,
    sales: 45,
    short: "بهترین دوربین محاسباتی با تراشه Tensor G3 و ۷ سال آپدیت",
    specs: { "صفحه‌نمایش": "6.7 اینچ LTPO OLED", "تراشه": "Google Tensor G3", "دوربین اصلی": "50+48+48 مگاپیکسل", "باتری": "5050 میلی‌آمپر", "سیستم‌عامل": "Android 14", "شبکه": "5G" },
    colors: [
      { name: "چینی", hex: "#efe9e0" },
      { name: "اوبسیدین", hex: "#1c1c1e" },
      { name: "آبی", hex: "#a7c1e0" },
    ],
    configs: [
      { storage: "128GB", ram: "12GB", extra: 0 },
      { storage: "256GB", ram: "12GB", extra: 4500000 },
    ],
    stock: 7,
  }),
  P({
    name: "گوشی گوگل Pixel 8a",
    slug: "google-pixel-8a",
    brand: "google",
    category: "midrange",
    image: IMG + "pixel.jpg",
    basePrice: 29900000,
    discount: 4,
    sales: 65,
    short: "تجربه خالص اندروید با دوربین عالی و قیمت میان‌رده",
    specs: { "صفحه‌نمایش": "6.1 اینچ OLED 120Hz", "تراشه": "Google Tensor G3", "دوربین اصلی": "64+13 مگاپیکسل", "باتری": "4492 میلی‌آمپر", "سیستم‌عامل": "Android 14", "شبکه": "5G" },
    colors: [
      { name: "چینی", hex: "#efe9e0" },
      { name: "اوبسیدین", hex: "#1c1c1e" },
      { name: "آلوئه", hex: "#b7d8b0" },
    ],
    configs: [
      { storage: "128GB", ram: "8GB", extra: 0 },
      { storage: "256GB", ram: "8GB", extra: 3000000 },
    ],
    stock: 10,
  }),
  P({
    name: "گوشی ناتینگ Nothing Phone (2)",
    slug: "nothing-phone-2",
    brand: "nothing",
    category: "flagship",
    image: IMG + "nothing.jpg",
    basePrice: 33900000,
    featured: true,
    sales: 95,
    short: "طراحی شفاف با رابط نوری Glyph و Snapdragon 8+ Gen 1",
    specs: { "صفحه‌نمایش": "6.7 اینچ LTPO OLED", "تراشه": "Snapdragon 8+ Gen 1", "دوربین اصلی": "50+50 مگاپیکسل", "باتری": "4700 میلی‌آمپر", "سیستم‌عامل": "Android 14 / Nothing OS 2.5", "شبکه": "5G" },
    colors: [
      { name: "سفید", hex: "#f2f2f2" },
      { name: "خاکستری تیره", hex: "#4a4a4a" },
    ],
    configs: [
      { storage: "256GB", ram: "12GB", extra: 0 },
      { storage: "512GB", ram: "12GB", extra: 3500000 },
    ],
    stock: 9,
  }),
  P({
    name: "گوشی ناتینگ Nothing Phone (2a)",
    slug: "nothing-phone-2a",
    brand: "nothing",
    category: "midrange",
    image: IMG + "nothing.jpg",
    basePrice: 19900000,
    sales: 130,
    short: "میان‌رده خوش‌قیمت ناتینگ با Dimensity 7200 Pro و رابط Glyph",
    specs: { "صفحه‌نمایش": "6.7 اینچ AMOLED 120Hz", "تراشه": "Dimensity 7200 Pro", "دوربین اصلی": "50+50 مگاپیکسل", "باتری": "5000 میلی‌آمپر", "سیستم‌عامل": "Android 14 / Nothing OS 2.5", "شبکه": "5G" },
    colors: [
      { name: "سفید", hex: "#f2f2f2" },
      { name: "مشکی", hex: "#1a1a1a" },
    ],
    configs: [
      { storage: "128GB", ram: "8GB", extra: 0 },
      { storage: "256GB", ram: "12GB", extra: 2000000 },
    ],
    stock: 17,
  }),
  P({
    name: "گوشی آنر Honor Magic6 Pro",
    slug: "honor-magic6-pro",
    brand: "honor",
    category: "flagship",
    image: IMG + "xiaomi-flagship.jpg",
    basePrice: 52900000,
    discount: 8,
    sales: 38,
    short: "پرچمدار آنر با دوربین پریسکوپی ۱۸۰ مگاپیکسلی و باتری سیلیکون-کربن",
    specs: { "صفحه‌نمایش": "6.8 اینچ LTPO OLED", "تراشه": "Snapdragon 8 Gen 3", "دوربین اصلی": "50+180+50 مگاپیکسل", "باتری": "5600 میلی‌آمپر", "سیستم‌عامل": "Android 14 / MagicOS 8", "شبکه": "5G" },
    colors: [
      { name: "مشکی", hex: "#1a1a1a" },
      { name: "سبز", hex: "#7fa38f" },
    ],
    configs: [{ storage: "512GB", ram: "12GB", extra: 0 }],
    stock: 5,
  }),
];

const reviewPool = [
  { rating: 5, title: "عالی و بی‌نقص", body: "کیفیت ساخت فوق‌العاده است و دوربین واقعاً حرف نداره. بسته‌بندی هم سالم و سریع رسید." },
  { rating: 4, title: "ارزش خرید داره", body: "با توجه به قیمتش گزینه خوبیه. باتری یک روز کامل جواب می‌ده. فقط کمی سنگینه." },
  { rating: 5, title: "بهترین خرید امسالم", body: "سرعت عملکرد و نمایشگر عالیه. برای بازی و کارهای روزمره کم نمیاره." },
  { rating: 3, title: "متوسط", body: "گوشی خوبیه ولی انتظار بیشتری داشتم. شارژر داخل جعبه نبود." },
  { rating: 4, title: "راضی‌ام", body: "ارسال سریع بود و گوشی اورجینال و پلمپ. رنگش هم خیلی خوشگله." },
  { rating: 5, title: "پیشنهاد می‌کنم", body: "بعد از دو ماه استفاده هیچ مشکلی ندیدم. پشتیبانی فروشگاه هم عالی بود." },
  { rating: 2, title: "داغ می‌کنه", body: "موقع بازی سنگین کمی گرم می‌شه. بقیه موارد قابل قبوله." },
];
const reviewers = ["علی رضایی", "مریم احمدی", "حسین کریمی", "سارا موسوی", "رضا نوری", "نگار حسینی", "امیر محمدی", "فاطمه صادقی"];

export async function isSeeded(): Promise<boolean> {
  const [row] = await db.select({ c: sql<number>`count(*)::int` }).from(products);
  return (row?.c ?? 0) > 0;
}

export async function runSeed() {
  // Brands
  const brandRows = await db
    .insert(brands)
    .values([
      { name: "اپل", slug: "apple", description: "محصولات اپل با گارانتی معتبر" },
      { name: "سامسونگ", slug: "samsung", description: "گوشی‌های سامسونگ گلکسی" },
      { name: "شیائومی", slug: "xiaomi", description: "شیائومی، ردمی و پوکو" },
      { name: "گوگل", slug: "google", description: "گوشی‌های پیکسل گوگل" },
      { name: "ناتینگ", slug: "nothing", description: "برند نوآور Nothing" },
      { name: "آنر", slug: "honor", description: "گوشی‌های آنر" },
    ])
    .returning();
  const brandMap = Object.fromEntries(brandRows.map((b) => [b.slug, b.id]));

  const catRows = await db
    .insert(categories)
    .values([
      { name: "پرچمدار", slug: "flagship", description: "قدرتمندترین گوشی‌های بازار با بهترین دوربین و عملکرد", metaTitle: "خرید گوشی پرچمدار | بهترین قیمت", metaDescription: "خرید انواع گوشی پرچمدار اپل، سامسونگ و شیائومی با گارانتی و ارسال سریع", sortOrder: 1 },
      { name: "میان‌رده", slug: "midrange", description: "بهترین نسبت قیمت به کارایی", metaTitle: "خرید گوشی میان‌رده | قیمت مناسب", metaDescription: "گوشی‌های میان‌رده با بهترین قیمت و کیفیت", sortOrder: 2 },
      { name: "اقتصادی", slug: "budget", description: "گوشی‌های ارزان و مقرون‌به‌صرفه", metaTitle: "خرید گوشی ارزان و اقتصادی", metaDescription: "خرید گوشی اقتصادی زیر ۱۵ میلیون تومان", sortOrder: 3 },
      { name: "گیمینگ", slug: "gaming", description: "گوشی‌های مخصوص بازی با پردازنده قوی", metaTitle: "خرید گوشی گیمینگ", metaDescription: "بهترین گوشی‌های گیمینگ با پردازنده قدرتمند", sortOrder: 4 },
      { name: "تاشو", slug: "foldable", description: "گوشی‌های تاشو و نسل جدید موبایل", metaTitle: "خرید گوشی تاشو", metaDescription: "خرید گوشی تاشو سامسونگ گلکسی Z", sortOrder: 5 },
    ])
    .returning();
  const catMap = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  // Users
  const adminHash = hashPassword(ADMIN_PASSWORD);
  const userHash = hashPassword("User@12345");
  const userRows = await db
    .insert(users)
    .values([
      { name: "مدیر سیستم", email: ADMIN_EMAIL, phone: "09120000000", passwordHash: adminHash, role: "admin", permissions: ["products", "orders", "users", "coupons", "content", "payments", "settings"], loyaltyPoints: 0, loyaltyTier: "bronze" },
      { name: "مدیر فروشگاه", email: "manager@example.com", phone: "09120000001", passwordHash: userHash, role: "manager", permissions: ["products", "orders", "coupons"], loyaltyPoints: 0 },
      { name: "علی رضایی", email: "ali@example.com", phone: "09121111111", passwordHash: userHash, role: "customer", loyaltyPoints: 7800, loyaltyTier: "gold", personalCoupon: "GOLD-ALI-7" },
      { name: "مریم احمدی", email: "maryam@example.com", phone: "09122222222", passwordHash: userHash, role: "customer", loyaltyPoints: 3100, loyaltyTier: "silver", personalCoupon: "SILVER-MARYAM-3" },
      { name: "حسین کریمی", email: "hossein@example.com", phone: "09123333333", passwordHash: userHash, role: "customer", loyaltyPoints: 450, loyaltyTier: "bronze" },
      { name: "سارا موسوی", email: "sara@example.com", phone: "09124444444", passwordHash: userHash, role: "customer", loyaltyPoints: 120, loyaltyTier: "bronze" },
    ])
    .returning();
  const [, , ali, maryam, hossein, sara] = userRows;

  await db.insert(addresses).values([
    { userId: ali.id, title: "خانه", receiverName: "علی رضایی", receiverPhone: "09121111111", province: "تهران", city: "تهران", postalCode: "1234567890", line: "خیابان ولیعصر، بالاتر از میدان ونک، کوچه شهید مهدوی، پلاک ۱۲، واحد ۳", isDefault: true },
    { userId: ali.id, title: "محل کار", receiverName: "علی رضایی", receiverPhone: "09121111111", province: "تهران", city: "تهران", postalCode: "1987654321", line: "سعادت‌آباد، بلوار دریا، برج آسمان، طبقه ۷" },
    { userId: maryam.id, title: "خانه", receiverName: "مریم احمدی", receiverPhone: "09122222222", province: "اصفهان", city: "اصفهان", postalCode: "8134567890", line: "خیابان چهارباغ بالا، کوچه گلستان، پلاک ۴۵", isDefault: true },
    { userId: hossein.id, title: "خانه", receiverName: "حسین کریمی", receiverPhone: "09123333333", province: "فارس", city: "شیراز", postalCode: "7134567890", line: "بلوار زند، کوچه ۱۲، پلاک ۸", isDefault: true },
    { userId: sara.id, title: "خانه", receiverName: "سارا موسوی", receiverPhone: "09124444444", province: "خراسان رضوی", city: "مشهد", postalCode: "9134567890", line: "بلوار وکیل‌آباد، وکیل‌آباد ۲۰، پلاک ۳", isDefault: true },
  ]);

  // Products
  const productMap: Record<string, { id: number; variants: { id: number; price: number; label: string }[]; image: string; name: string }> = {};
  let i = 0;
  for (const sp of seedProducts) {
    i++;
    const discount = sp.discount ?? 0;
    const price = Math.round((sp.basePrice * (100 - discount)) / 100 / 1000) * 1000;
    const createdAt = new Date(Date.now() - (seedProducts.length - i) * 3 * 24 * 3600 * 1000);
    const [p] = await db
      .insert(products)
      .values({
        name: sp.name,
        slug: sp.slug,
        sku: `SKU-${1000 + i}`,
        brandId: brandMap[sp.brand],
        categoryId: catMap[sp.category],
        shortDescription: sp.short,
        description: `${sp.short}.\n\n${sp.name} یکی از محبوب‌ترین گوشی‌های بازار است که با ${sp.specs["تراشه"]} و نمایشگر ${sp.specs["صفحه‌نمایش"]} عملکردی روان و تجربه‌ای لذت‌بخش ارائه می‌دهد. دوربین ${sp.specs["دوربین اصلی"]} این گوشی در شرایط مختلف نوری تصاویری باکیفیت ثبت می‌کند و باتری ${sp.specs["باتری"]} آن برای یک روز کامل استفاده کافی است.\n\nتمامی محصولات اکسیر موبایل اورجینال، پلمپ و دارای ۱۸ ماه گارانتی معتبر و رجیستری هستند. امکان خرید آنلاین با ارسال سریع یا تحویل حضوری از فروشگاه فراهم است.`,
        basePrice: price,
        compareAtPrice: discount ? sp.basePrice : null,
        discountPercent: discount,
        specs: sp.specs,
        isFeatured: !!sp.featured,
        salesCount: sp.sales,
        viewsCount: sp.sales * 12 + 200,
        metaTitle: `خرید ${sp.name} | قیمت و مشخصات`,
        metaDescription: `خرید ${sp.name} با بهترین قیمت، گارانتی ۱۸ ماهه و ارسال سریع. ${sp.short}`,
        createdAt,
        updatedAt: createdAt,
      })
      .returning();

    await db.insert(productImages).values([
      { productId: p.id, url: sp.image, alt: `${sp.name} - نمای جلو و پشت`, sortOrder: 0 },
      { productId: p.id, url: sp.image, alt: `${sp.name} - رنگ ${sp.colors[0].name}`, sortOrder: 1 },
      { productId: p.id, url: sp.image, alt: `${sp.name} - جزئیات دوربین`, sortOrder: 2 },
    ]);

    const variantValues = sp.colors.flatMap((c, ci) =>
      sp.configs.map((cfg, gi) => ({
        productId: p.id,
        color: c.name,
        colorHex: c.hex,
        storage: cfg.storage,
        ram: cfg.ram,
        price: price + Math.round(cfg.extra / 1000) * 1000,
        stock: sp.stock === 0 ? 0 : Math.max(0, sp.stock - ci * 2 - gi),
        sku: `${p.sku}-${ci}${gi}`,
      }))
    );
    const vRows = await db.insert(productVariants).values(variantValues).returning();
    productMap[sp.slug] = {
      id: p.id,
      name: sp.name,
      image: sp.image,
      variants: vRows.map((v) => ({ id: v.id, price: v.price, label: `${v.color} / ${v.storage} / رم ${v.ram}` })),
    };

    // Reviews
    const nReviews = 2 + (i % 4);
    const rvs = [];
    for (let r = 0; r < nReviews; r++) {
      const rv = reviewPool[(i + r) % reviewPool.length];
      rvs.push({
        productId: p.id,
        authorName: reviewers[(i * 3 + r) % reviewers.length],
        rating: rv.rating,
        title: rv.title,
        body: rv.body,
        createdAt: new Date(Date.now() - (r + 1) * 5 * 24 * 3600 * 1000),
      });
    }
    await db.insert(reviews).values(rvs);
    const avg = rvs.reduce((a, b) => a + b.rating, 0) / rvs.length;
    await db.update(products).set({ ratingAvg: avg.toFixed(2), ratingCount: rvs.length }).where(sql`${products.id} = ${p.id}`);
  }

  // Coupons
  await db.insert(coupons).values([
    { code: "WELCOME10", type: "percent", value: 10, minOrder: 5000000, maxDiscount: 3000000, usageLimit: 1000 },
    { code: "SUMMER500", type: "fixed", value: 500000, minOrder: 10000000, usageLimit: 200 },
    { code: "GOLD-ALI-7", type: "percent", value: 7, minOrder: 0, maxDiscount: 5000000, userId: ali.id },
    { code: "SILVER-MARYAM-3", type: "percent", value: 3, minOrder: 0, maxDiscount: 2000000, userId: maryam.id },
    { code: "EXPIRED", type: "percent", value: 20, isActive: false, expiresAt: new Date("2024-01-01") },
  ]);

  // Orders
  const mk = async (
    user: typeof ali,
    slug: string,
    qty: number,
    status: "pending_payment" | "processing" | "shipped" | "delivered" | "cancelled",
    daysAgo: number,
    paymentMethod: "zarinpal" | "cod" | "in_store" = "zarinpal",
    shippingMethod: "post" | "express" | "pickup" = "post",
    idx = 0
  ) => {
    const prod = productMap[slug];
    const v = prod.variants[0];
    const subtotal = v.price * qty;
    const shippingCost = shippingMethod === "post" ? 45000 : shippingMethod === "express" ? 90000 : 0;
    const total = subtotal + shippingCost;
    const created = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
    const paid = status !== "pending_payment" && status !== "cancelled";
    const [o] = await db
      .insert(orders)
      .values({
        orderNumber: `MC-2405-${String(100100 + idx)}`,
        userId: user.id,
        status,
        paymentStatus: paid ? "paid" : "unpaid",
        paymentMethod,
        shippingMethod,
        paymentRef: paid && paymentMethod === "zarinpal" ? `ZP-${Math.floor(1000000 + Math.random() * 9000000)}` : null,
        subtotal,
        shippingCost,
        total,
        pointsEarned: paid ? Math.floor(total / 100000) : 0,
        shippingAddress: { receiverName: user.name, receiverPhone: user.phone ?? "", province: "تهران", city: "تهران", postalCode: "1234567890", line: "خیابان ولیعصر، پلاک ۱۲" },
        trackingCode: status === "shipped" || status === "delivered" ? `POST${Math.floor(100000000 + Math.random() * 900000000)}` : null,
        createdAt: created,
        updatedAt: created,
      })
      .returning();
    await db.insert(orderItems).values({ orderId: o.id, productId: prod.id, variantId: v.id, productName: prod.name, variantLabel: v.label, image: prod.image, unitPrice: v.price, quantity: qty });
    const steps: ("pending_payment" | "processing" | "shipped" | "delivered" | "cancelled")[] =
      status === "cancelled" ? ["pending_payment", "cancelled"] : (["pending_payment", "processing", "shipped", "delivered"] as const).slice(0, ["pending_payment", "processing", "shipped", "delivered"].indexOf(status) + 1);
    await db.insert(orderStatusHistory).values(
      steps.map((s, k) => ({ orderId: o.id, status: s, note: s === "pending_payment" ? "سفارش ثبت شد" : s === "processing" ? "پرداخت تأیید و سفارش در حال آماده‌سازی است" : s === "shipped" ? "مرسوله تحویل پست شد" : s === "delivered" ? "سفارش با موفقیت تحویل داده شد" : "سفارش توسط مشتری لغو شد", createdAt: new Date(created.getTime() + k * 12 * 3600 * 1000) }))
    );
    if (paid) {
      await db.insert(loyaltyTransactions).values({ userId: user.id, points: Math.floor(total / 100000), reason: `امتیاز خرید سفارش ${o.orderNumber}`, orderId: o.id, createdAt: created });
    }
  };

  await mk(ali, "samsung-galaxy-s24-ultra", 1, "delivered", 40, "zarinpal", "express", 1);
  await mk(ali, "apple-iphone-15-pro-max", 1, "delivered", 25, "zarinpal", "post", 2);
  await mk(ali, "xiaomi-redmi-note-13-pro-plus", 2, "shipped", 4, "zarinpal", "post", 3);
  await mk(ali, "xiaomi-poco-f6", 1, "pending_payment", 0, "zarinpal", "post", 4);
  await mk(maryam, "samsung-galaxy-a55", 1, "delivered", 30, "cod", "post", 5);
  await mk(maryam, "apple-iphone-15", 1, "processing", 2, "zarinpal", "express", 6);
  await mk(maryam, "nothing-phone-2a", 1, "cancelled", 12, "zarinpal", "post", 7);
  await mk(hossein, "xiaomi-redmi-note-13", 1, "delivered", 18, "in_store", "pickup", 8);
  await mk(hossein, "samsung-galaxy-a15", 2, "processing", 1, "cod", "post", 9);
  await mk(sara, "xiaomi-redmi-13c", 1, "delivered", 9, "zarinpal", "post", 10);
  await mk(sara, "google-pixel-8a", 1, "shipped", 3, "zarinpal", "express", 11);
  await mk(ali, "xiaomi-14", 1, "delivered", 60, "zarinpal", "post", 12);
  await mk(maryam, "samsung-galaxy-s23-fe", 1, "delivered", 75, "zarinpal", "post", 13);

  await db.insert(loyaltyTransactions).values([
    { userId: ali.id, points: 500, reason: "هدیه عضویت در باشگاه مشتریان", createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000) },
    { userId: maryam.id, points: 500, reason: "هدیه عضویت در باشگاه مشتریان", createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000) },
    { userId: ali.id, points: 200, reason: "ثبت نظر برای محصول", createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000) },
  ]);

  await db.insert(wishlists).values([
    { userId: ali.id, productId: productMap["samsung-galaxy-z-fold5"].id },
    { userId: ali.id, productId: productMap["xiaomi-14-ultra"].id },
    { userId: maryam.id, productId: productMap["apple-iphone-15-pro"].id },
  ]);

  await db.insert(banners).values([
    { title: "جشنواره تابستانه اکسیر موبایل", subtitle: "تا ۱۲٪ تخفیف روی پرچمدارهای سامسونگ و اپل + ارسال رایگان", image: "/images/hero.jpg", link: "/products?sort=discount", position: "hero", sortOrder: 0 },
    { title: "سری Galaxy S24 با هوش مصنوعی", subtitle: "Galaxy AI را تجربه کنید", image: "/images/phones/galaxy-ultra.jpg", link: "/product/samsung-galaxy-s24-ultra", position: "side", sortOrder: 1 },
    { title: "آیفون ۱۵ پرو مکس", subtitle: "تیتانیوم. قدرتمند. سبک.", image: "/images/phones/iphone-pro.jpg", link: "/product/apple-iphone-15-pro-max", position: "side", sortOrder: 2 },
  ]);

  await db.insert(pages).values([
    { title: "درباره ما", slug: "about", content: "اکسیر موبایل از سال ۱۳۹۲ فعالیت خود را در زمینه فروش حضوری گوشی‌های موبایل آغاز کرد و امروز با فروشگاه اینترنتی خود، خدمات خرید آنلاین و حضوری را به مشتریان سراسر کشور ارائه می‌دهد.\n\nتمامی محصولات ما اورجینال، پلمپ و دارای گارانتی معتبر و رجیستری هستند. فروشگاه حضوری ما در تهران، خیابان ولیعصر، پاساژ علاءالدین واقع شده است.", metaTitle: "درباره اکسیر موبایل", metaDescription: "آشنایی با فروشگاه اکسیر موبایل؛ فروش آنلاین و حضوری گوشی موبایل با گارانتی معتبر" },
    { title: "شرایط بازگشت کالا", slug: "returns", content: "مشتریان گرامی می‌توانند تا ۷ روز پس از دریافت کالا، در صورت وجود مشکل فنی یا مغایرت با سفارش، درخواست بازگشت کالا ثبت کنند.\n\nشرایط:\n- پلمپ کالا نباید باز شده باشد (به‌جز مواردی که ایراد فنی وجود دارد)\n- کالا باید همراه با تمامی لوازم جانبی و جعبه اصلی بازگردانده شود\n- هزینه ارسال در صورت ایراد فنی بر عهده فروشگاه است", metaTitle: "شرایط بازگشت کالا | اکسیر موبایل", metaDescription: "شرایط و قوانین بازگشت کالا در فروشگاه اکسیر موبایل" },
    { title: "تماس با ما", slug: "contact", content: "آدرس فروشگاه حضوری: تهران، خیابان ولیعصر، پاساژ علاءالدین، طبقه دوم، واحد ۲۱۵\n\nتلفن: ۰۲۱-۸۸۸۸۸۸۸۸\nموبایل: ۰۹۱۲۰۰۰۰۰۰۰\nایمیل: info@elixir-mobile.example\n\nساعات کاری: شنبه تا پنجشنبه، ۱۰ صبح تا ۹ شب", metaTitle: "تماس با اکسیر موبایل", metaDescription: "راه‌های ارتباط با فروشگاه اکسیر موبایل" },
    { title: "راهنمای خرید", slug: "guide", content: "۱. محصول مورد نظر را انتخاب و رنگ و حافظه دلخواه را مشخص کنید.\n۲. محصول را به سبد خرید اضافه کنید.\n۳. در مرحله تسویه حساب، آدرس، روش ارسال و روش پرداخت را انتخاب کنید.\n۴. پس از پرداخت، کد رهگیری سفارش برای شما ارسال می‌شود.\n\nهمچنین می‌توانید سفارش خود را به‌صورت حضوری از فروشگاه تحویل بگیرید و همان‌جا پرداخت کنید.", metaTitle: "راهنمای خرید از اکسیر موبایل", metaDescription: "راهنمای گام‌به‌گام خرید آنلاین و حضوری از اکسیر موبایل" },
  ]);

  await db.insert(settings).values([
    { key: "site_name", value: "اکسیر موبایل" },
    { key: "site_tagline", value: "فروشگاه آنلاین و حضوری گوشی موبایل" },
    { key: "meta_title", value: "اکسیر موبایل | خرید آنلاین گوشی موبایل با بهترین قیمت" },
    { key: "meta_description", value: "خرید آنلاین انواع گوشی موبایل اپل، سامسونگ، شیائومی و... با گارانتی معتبر، بهترین قیمت و ارسال سریع. امکان تحویل حضوری از فروشگاه." },
    { key: "meta_keywords", value: "خرید گوشی, قیمت موبایل, آیفون, سامسونگ, شیائومی" },
    { key: "store_address", value: "تهران، خیابان ولیعصر، پاساژ علاءالدین، طبقه دوم، واحد ۲۱۵" },
    { key: "store_phone", value: "021-88888888" },
    { key: "free_shipping_threshold", value: "30000000" },
    { key: "points_per_toman", value: "100000" },
    { key: "announcement", value: "ارسال رایگان برای سفارش‌های بالای ۳۰ میلیون تومان" },
  ]);

  await db.insert(paymentGateways).values([
    { key: "zarinpal", name: "درگاه زرین‌پال", description: "پرداخت آنلاین با کلیه کارت‌های عضو شتاب (حالت شبیه‌سازی‌شده)", isActive: true, config: { merchant_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", sandbox: "true", callback_url: "/api/payment/zarinpal/verify" }, sortOrder: 0 },
    { key: "cod", name: "پرداخت در محل", description: "پرداخت نقدی یا با کارت هنگام تحویل مرسوله", isActive: true, config: { max_amount: "50000000" }, sortOrder: 1 },
    { key: "in_store", name: "پرداخت حضوری", description: "تحویل و پرداخت در فروشگاه", isActive: true, config: {}, sortOrder: 2 },
  ]);

  // ---------- Articles & Media ----------
  const articleCats = await db
    .insert(articleCategories)
    .values([
      { name: "راهنمای خرید", slug: "buying-guide", sortOrder: 1 },
      { name: "اخبار تکنولوژی", slug: "tech-news", sortOrder: 2 },
      { name: "مقایسه محصولات", slug: "comparison", sortOrder: 3 },
    ])
    .returning();
  const articleCatMap = Object.fromEntries(articleCats.map((c) => [c.slug, c.id]));

  const seedArticles = [
    { title: "راهنمای خرید گوشی موبایل در سال ۱۴۰۳", slug: "mobile-buying-guide-1403", cat: "buying-guide", img: "/images/phones/iphone-pro.jpg", excerpt: "با این راهنمای جامع، بهترین گوشی متناسب با بودجه و نیاز خود را انتخاب کنید؛ از پرچمدار تا اقتصادی.", body: "انتخاب گوشی مناسب همیشه یکی از چالش‌های اصلی خریداران است...\n\nدر این مقاله ابتدا باید بودجه خود را مشخص کنید؛ سپس به نیازهای اصلی‌تان یعنی دوربین، باتری، صفحه‌نمایش و عملکرد پردازنده توجه کنید." },
    { title: "مقایسه آیفون ۱۵ پرو مکس با گلکسی S24 اولترا", slug: "iphone-15-pro-max-vs-galaxy-s24-ultra", cat: "comparison", img: "/images/phones/galaxy-ultra.jpg", excerpt: "دو پرچمدار بزرگ سال را از نظر دوربین، باتری و عملکرد با هم مقایسه می‌کنیم.", body: "رقابت اپل و سامسونگ در رده پرچمدار همیشه داغ بوده است...\n\nهر دو گوشی در بخش دوربین حرف‌های زیادی برای گفتن دارند اما تفاوت‌های مهمی در تجربه کاربری دارند." },
    { title: "۵ نکته برای افزایش عمر باتری گوشی", slug: "5-tips-battery-life", cat: "buying-guide", img: "/images/phones/pixel.jpg", excerpt: "با رعایت این نکات ساده عمر باتری گوشی خود را به‌شکل چشمگیری افزایش دهید.", body: "باتری گوشی پس از مدتی استفاده دچار افت می‌شود...\n\nشارژ هوشمند، اجتناب از گرما و استفاده از شارژر استاندارد از مهم‌ترین نکات هستند." },
    { title: "معرفی سری گلکسی S24 سامسونگ با Galaxy AI", slug: "galaxy-s24-series-review", cat: "tech-news", img: "/images/phones/galaxy-ultra.jpg", excerpt: "نسل جدید پرچمدارهای سامسونگ با قابلیت‌های هوش مصنوعی معرفی شد.", body: "سامسونگ امسال تمرکز ویژه‌ای روی هوش مصنوعی داشته است...\n\nقابلیت‌های ترجمه زنده، ویرایش تصویر هوشمند و خلاصه‌سازی یادداشت‌ها از جمله امکانات جدید است." },
    { title: "گوشی‌های تاشو: آینده صنعت موبایل؟", slug: "foldable-phones-future", cat: "tech-news", img: "/images/phones/galaxy-a.jpg", excerpt: "بررسی روند رشد گوشی‌های تاشو و پیش‌بینی آینده این دسته از محصولات.", body: "گوشی‌های تاشو از یک نوآوری لوکس به محصولی کاربردی تبدیل شده‌اند...\n\nبا کاهش قیمت و بهبود دوام، این دسته از گوشی‌ها در حال فراگیر شدن هستند." },
    { title: "مقایسه دوربین گوشی‌های میان‌رده ۲۰۲۴", slug: "midrange-camera-comparison-2024", cat: "comparison", img: "/images/phones/redmi.jpg", excerpt: "کدام میان‌رده بهترین دوربین را دارد؟ ردمی، گلکسی A یا پیکسل a؟", body: "دوربین دیگر مخصوص گوشی‌های پرچمدار نیست...\n\nدر این مقایسه گوشی‌های میان‌رده محبوب را از نظر کیفیت عکاسی بررسی می‌کنیم." },
  ];
  const now = Date.now();
  for (let i = 0; i < seedArticles.length; i++) {
    const a = seedArticles[i];
    await db.insert(articles).values({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.body + "\n\nبرای مشاهده و خرید جدیدترین گوشی‌های موبایل به فروشگاه اکسیر موبایل مراجعه کنید.",
      coverImage: a.img,
      categoryId: articleCatMap[a.cat],
      authorName: "تیم اکسیر موبایل",
      tags: a.cat === "comparison" ? ["مقایسه", "بررسی"] : a.cat === "buying-guide" ? ["راهنما", "خرید"] : ["اخبار"],
      isPublished: true,
      viewsCount: (seedArticles.length - i) * 47 + 12,
      publishedAt: new Date(now - (seedArticles.length - i) * 4 * 24 * 3600 * 1000),
    });
  }

  await db.insert(media).values([
    { filename: "hero.jpg", originalName: "بنر اصلی فروشگاه", mimeType: "image/jpeg", size: 123107, url: "/images/hero.jpg", width: 1536, height: 576, alt: "بنر اصلی اکسیر موبایل" },
    { filename: "iphone-pro.jpg", originalName: "آیفون ۱۵ پرو مکس", mimeType: "image/jpeg", size: 61338, url: "/images/phones/iphone-pro.jpg", width: 1024, height: 1024, alt: "iPhone 15 Pro Max" },
    { filename: "galaxy-ultra.jpg", originalName: "گلکسی S24 اولترا", mimeType: "image/jpeg", size: 53776, url: "/images/phones/galaxy-ultra.jpg", width: 1024, height: 1024, alt: "Galaxy S24 Ultra" },
  ]);
}

let seedPromise: Promise<void> | null = null;
export async function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      if (!(await isSeeded())) {
        await runSeed();
        console.log("✅ Database seeded");
      }
    } catch (e) {
      console.error("Seed failed", e);
      seedPromise = null;
    }
  })();
  return seedPromise;
}
