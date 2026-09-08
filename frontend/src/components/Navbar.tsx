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

  // Determine if current page is inside the application (Dashboard, Workouts, Meals, Progress, Settings, Admin)
  const isAppRoute =
    pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register");

  const logoHref = isAppRoute ? "/dashboard" : "/";

  if (!mounted) {
    return (
      <nav className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <BrandMark className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Strive</span>
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
    <nav className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-2 group">
            <BrandMark className="h-7 w-7 text-blue-600 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Strive</span>
          </Link>

          {/* Centered navigation links */}
          {isAppRoute ? (
            /* App Navigation Tabs */
            <div className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/50">
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
                      active
                        ? "bg-white text-blue-600 shadow-sm shadow-slate-200 border border-slate-200/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-white text-amber-600 shadow-sm shadow-slate-200 border border-slate-200/50"
                      : "text-slate-600 hover:text-amber-600 hover:bg-white/50"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            /* Landing Page Marketing Links */
            <div className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
              {landingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-all duration-150 hover:scale-105"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {!isAppRoute && (
                  <Link
                    href="/dashboard"
                    className="text-sm font-semibold text-white bg-blue-600 px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shadow-inner border border-blue-200/60">
                    {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-900 font-bold max-w-[130px] truncate leading-tight">
                      {user.fullName || user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold capitalize leading-none mt-0.5">
                      {user.role || "Member"}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="ml-1 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-white bg-blue-600 px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 py-4 px-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {isAppRoute ? (
            <>
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 text-sm font-bold py-2.5 px-3 rounded-xl transition-all ${
                      active ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
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
                  className={`flex items-center gap-3 text-sm font-bold py-2.5 px-3 rounded-xl transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-50 text-amber-600"
                      : "text-slate-700 hover:text-amber-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          ) : (
            landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-semibold text-slate-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))
          )}

          {user ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {!isAppRoute && (
                <Link
                  href="/dashboard"
                  className="block text-base font-semibold text-white bg-blue-600 px-4 py-2.5 rounded-full text-center hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center w-full text-sm font-bold text-red-600 hover:bg-red-50 p-2.5 rounded-xl gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out ({user.fullName || user.name})</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                href="/login"
                className="block text-base font-semibold text-slate-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-base font-semibold text-white bg-blue-600 px-4 py-2.5 rounded-full text-center hover:bg-blue-700 transition-colors"
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
