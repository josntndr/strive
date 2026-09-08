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
  Sparkles,
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

  // Determine if current page is inside the application (Dashboard, Workouts, Meals, Progress, Settings, Admin)
  const isAppRoute =
    pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register");

  const logoHref = isAppRoute ? "/dashboard" : "/";

  if (!mounted) {
    return (
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 rounded-xl text-white shadow-md shadow-blue-500/20">
                <BrandMark className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">Strive</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-50 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo Badge */}
          <Link href={logoHref} className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 p-1.5 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BrandMark className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">Strive</span>
              {isAppRoute && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider border border-blue-100">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                  AI
                </span>
              )}
            </div>
          </Link>

          {/* Centered Navigation Bar */}
          {isAppRoute ? (
            /* App Dashboard Navigation (High Craft Pill) */
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-xs font-extrabold px-4 py-1.5 rounded-full transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/70 hover:scale-[1.01]"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        active ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-2 text-xs font-extrabold px-4 py-1.5 rounded-full transition-all duration-200 ${
                    pathname.startsWith("/admin")
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]"
                      : "text-slate-600 hover:text-amber-600 hover:bg-white/70"
                  }`}
                >
                  <ShieldCheck
                    className={`w-3.5 h-3.5 ${
                      pathname.startsWith("/admin") ? "text-white" : "text-amber-500"
                    }`}
                  />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            /* Public Landing Page Links */
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {landingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-all hover:scale-105"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {!isAppRoute && (
                  <Link
                    href="/dashboard"
                    className="text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80">
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/70 p-1 pl-1.5 pr-3 rounded-full hover:bg-slate-100/80 transition-all">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs ring-2 ring-white">
                      {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-900 font-extrabold max-w-[120px] truncate leading-tight">
                        {user.fullName || user.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold capitalize leading-none mt-0.5">
                        {user.role || "Member"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-extrabold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100 py-4 px-4 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          {isAppRoute ? (
            <>
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 text-sm font-extrabold py-2.5 px-3.5 rounded-2xl transition-all ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-3 text-sm font-extrabold py-2.5 px-3.5 rounded-2xl transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                      : "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          ) : (
            landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-bold text-slate-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))
          )}

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {!isAppRoute && (
                <Link
                  href="/dashboard"
                  className="block text-base font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 rounded-full text-center shadow-md hover:bg-blue-700 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center w-full text-sm font-bold text-rose-600 hover:bg-rose-50 p-3 rounded-2xl gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out ({user.fullName || user.name})</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/login"
                className="block text-base font-bold text-slate-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-base font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 rounded-full text-center shadow-md transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
