"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useEffect, useState } from "react";
import { AUTH_CHANGED_EVENT, clearAuth, getStoredUser, getToken } from "@/lib/api";
import type { AuthUser } from "@/lib/api";

const landingNavLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
];

const appNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/meals", label: "Meal Plan", icon: Utensils },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(getToken() ? getStoredUser() : null);
      setMounted(true);
    };

    const id = requestAnimationFrame(syncUser);
    window.addEventListener(AUTH_CHANGED_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const signOut = () => {
    clearAuth();
    setUser(null);
    setIsMenuOpen(false);
    router.replace("/login");
  };

  const isAppRoute =
    pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register");

  const logoHref = isAppRoute ? "/dashboard" : "/";

  if (!mounted && isAppRoute) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <BrandMark className="h-9 w-9 drop-shadow-sm" priority />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">Strive</span>
          </Link>
        </div>
      </header>
    );
  }

  const isActiveLink = (href: string) => {
    const normalizedPath = (pathname || "").replace(/\/+$/, "") || "/";
    const normalizedHref = href.replace(/\/+$/, "") || "/";

    if (normalizedHref === "/dashboard") {
      return normalizedPath === "/dashboard" || normalizedPath.startsWith("/dashboard");
    }
    return normalizedPath.startsWith(normalizedHref);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={logoHref} className="flex items-center gap-3 group">
          <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
            <BrandMark className="h-9 w-9 drop-shadow-sm" priority />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">Strive</span>
        </Link>

        {/* Navigation Links */}
        {isAppRoute ? (
          /* App Dashboard Navigation Links */
          <div className="hidden lg:flex items-center gap-2">
            {appNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm px-3.5 py-2 transition-colors group ${
                    active
                      ? "text-blue-600 font-extrabold"
                      : "text-slate-500 hover:text-slate-900 font-semibold"
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 transition-colors ${
                      active ? "text-blue-600 stroke-[2.5]" : "text-slate-400 group-hover:text-slate-700 stroke-[2]"
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-2 text-sm px-3.5 py-2 transition-colors group ${
                  pathname.startsWith("/admin")
                    ? "text-amber-600 font-extrabold"
                    : "text-slate-500 hover:text-slate-900 font-semibold"
                }`}
              >
                <ShieldCheck
                  className={`w-4.5 h-4.5 transition-colors ${
                    pathname.startsWith("/admin") ? "text-amber-600 stroke-[2.5]" : "text-slate-400 group-hover:text-slate-700 stroke-[2]"
                  }`}
                />
                <span>Admin</span>
              </Link>
            )}
          </div>
        ) : (
          /* Public Landing Page Links */
          <div className="hidden lg:flex items-center gap-9">
            {landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-bold text-slate-700 hover:text-blue-600 transition-all hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Actions: On landing page, always show public Login / Sign up. Only show account on app routes. */}
        <div className="hidden lg:flex items-center gap-4">
          {isAppRoute && user ? (
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-white">
                  {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm text-slate-900 font-extrabold max-w-[140px] truncate leading-tight">
                    {user.fullName || user.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold capitalize leading-none mt-0.5">
                    {user.role || "Member"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all focus:outline-none"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-extrabold text-slate-700 hover:text-blue-600 px-4 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-extrabold text-white bg-blue-600 px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-2xl px-4 sm:px-6 py-4 space-y-2.5 shadow-xl animate-in slide-in-from-top duration-200">
          {isAppRoute ? (
            <>
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 text-base py-3 px-4 rounded-xl transition-colors ${
                      active
                        ? "text-blue-600 font-extrabold"
                        : "text-slate-600 hover:text-slate-900 font-semibold"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-blue-600 stroke-[2.5]" : "text-slate-400 stroke-[2]"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-3 text-base py-3 px-4 rounded-xl transition-colors ${
                    pathname.startsWith("/admin")
                      ? "text-amber-600 font-extrabold"
                      : "text-slate-600 hover:text-slate-900 font-semibold"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck className={`w-5 h-5 ${pathname.startsWith("/admin") ? "text-amber-600 stroke-[2.5]" : "text-slate-400 stroke-[2]"}`} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          ) : (
            landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-bold text-slate-700 hover:text-blue-600 py-2.5 px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))
          )}

          {isAppRoute && user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => signOut()}
                className="flex items-center w-full text-base font-bold text-rose-600 hover:bg-rose-50 p-3 rounded-2xl gap-2.5 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out ({user.fullName || user.name})</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/login"
                className="block text-base font-bold text-slate-700 py-2.5 px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-base font-extrabold text-white bg-blue-600 px-4 py-3 rounded-full text-center shadow-md transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
