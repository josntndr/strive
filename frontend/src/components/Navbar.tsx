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
  ChevronDown,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useEffect, useRef, useState } from "react";
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleDocumentClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  const signOut = () => {
    clearAuth();
    setUser(null);
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    router.replace("/login");
  };

  const isAppRoute =
    pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register");

  const logoHref = isAppRoute ? "/dashboard" : "/";

  if (!mounted && isAppRoute) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
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
      return normalizedPath === "/dashboard";
    }
    return normalizedPath.startsWith(normalizedHref);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Brand Logo - Fixed and preserved as requested */}
        <Link href={logoHref} className="flex items-center gap-3 group shrink-0">
          <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
            <BrandMark className="h-9 w-9 drop-shadow-sm" priority />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">Strive</span>
        </Link>

        {/* Navigation Bar / Segmented Dock */}
        {isAppRoute ? (
          /* Bespoke Segmented App Dock */
          <nav
            aria-label="Application navigation"
            className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          >
            {appNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 group select-none ${
                    active
                      ? "bg-white text-slate-950 font-bold shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? "text-[#ed4f28] stroke-[2.2]"
                        : "text-slate-400 group-hover:text-slate-700 stroke-[1.8]"
                    }`}
                  />
                  <span>{link.label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ed4f28]" />
                  )}
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 group select-none ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-500 text-white font-bold shadow-xs"
                    : "text-amber-700 hover:text-amber-950 hover:bg-amber-50"
                }`}
              >
                <ShieldCheck
                  className={`w-4 h-4 transition-colors ${
                    pathname.startsWith("/admin")
                      ? "text-white stroke-[2.2]"
                      : "text-amber-600 stroke-[1.8]"
                  }`}
                />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        ) : (
          /* Public Landing Page Links */
          <nav
            aria-label="Public navigation"
            className="hidden lg:flex items-center gap-1 bg-slate-100/60 p-1 rounded-full border border-slate-200/50"
          >
            {landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-4 py-1.5 rounded-full hover:bg-white/80 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Section: Elevated Profile Capsule or Public Auth */}
        <div className="hidden lg:flex items-center gap-2.5">
          {isAppRoute && user ? (
            <div className="flex items-center gap-2">
              {/* Profile Capsule with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-150 select-none ${
                    isProfileOpen
                      ? "bg-slate-100 border-slate-300 ring-2 ring-slate-200/60 shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 shadow-xs"
                  }`}
                  aria-expanded={isProfileOpen}
                  aria-label="User account menu"
                >
                  {/* Avatar with Status Indicator */}
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-indigo-950 text-white font-bold flex items-center justify-center text-xs shadow-xs ring-1 ring-white">
                      {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  {/* Full Name & Role - No artificial narrow truncation */}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
                      {user.fullName || user.name || "My Account"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 capitalize leading-none mt-0.5">
                      {user.role === "admin" ? "Administrator" : "Member"}
                    </span>
                  </div>

                  {/* Dropdown Chevron */}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180 text-slate-700" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-slate-200/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Summary Header */}
                    <div className="px-3 py-2.5 bg-slate-50/80 rounded-xl mb-1 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {user.fullName || user.name}
                      </p>
                      {user.email && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      )}
                    </div>

                    {/* Menu Links */}
                    <div className="space-y-0.5">
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account & Preferences</span>
                      </Link>
                      <Link
                        href="/progress"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 rounded-xl transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span>My Progress</span>
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out Option */}
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="flex items-center w-full gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated Quick Sign Out Icon Button */}
              <button
                type="button"
                onClick={() => signOut()}
                className="h-8.5 w-8.5 rounded-full border border-slate-200/80 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all shadow-xs focus:outline-none"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 px-3.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-bold text-white bg-slate-950 hover:bg-slate-800 px-4.5 py-1.5 rounded-full shadow-xs active:scale-95 transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-2xl px-4 sm:px-6 py-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {isAppRoute ? (
            <>
              {/* User summary card in drawer */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 text-white font-bold flex items-center justify-center text-sm ring-1 ring-black/5">
                    {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {user.fullName || user.name}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {user.email || (user.role === "admin" ? "Administrator" : "Member")}
                    </span>
                  </div>
                </div>
              )}

              {/* Drawer App Links */}
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 text-sm py-2.5 px-3.5 rounded-xl font-semibold transition-colors ${
                      active
                        ? "bg-slate-100 text-slate-950 font-bold border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className={`w-4.5 h-4.5 ${active ? "text-[#ed4f28]" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-3 text-sm py-2.5 px-3.5 rounded-xl font-semibold transition-colors ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-50 text-amber-700 font-bold border border-amber-200/80"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex items-center w-full text-sm font-bold text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl gap-2.5 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {landingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-semibold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-lg hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  href="/login"
                  className="block text-center text-sm font-bold text-slate-700 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-center text-sm font-bold text-white bg-slate-950 py-2.5 px-4 rounded-xl shadow-xs hover:bg-slate-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
