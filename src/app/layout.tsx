import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";
import { CartProvider } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.meta_title || "اکسیر موبایل";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${s.site_name || "اکسیر موبایل"}` },
    description: s.meta_description,
    keywords: s.meta_keywords?.split(",").map((k) => k.trim()),
    openGraph: { type: "website", locale: "fa_IR", siteName: s.site_name, title, description: s.meta_description, images: ["/images/hero.jpg"] },
    twitter: { card: "summary_large_image", title, description: s.meta_description },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="min-h-screen font-sans">
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
