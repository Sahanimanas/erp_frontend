/**
 * SiteLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shell for the public marketing site (ported from School-erp-main).
 *
 * Renders the sticky Navbar, the routed page, and the Footer. Everything sits
 * inside `.gsm-site`, which is where the marketing design tokens are defined
 * (see index.css) — so the navy/orange palette, Outfit/Manrope type and dark
 * mode apply here and nowhere else in the ERP app.
 *
 * The `pt-*` on <main> offsets the fixed navbar (announcement strip + main bar).
 */
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@site/lib/theme";
import Navbar from "@site/components/Navbar";
import Footer from "@site/components/Footer";
import ScrollToTop from "@site/components/ScrollToTop";

export default function SiteLayout() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="gsm-site min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main data-testid="main-content" className="flex-1 pt-[76px] md:pt-[112px]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
