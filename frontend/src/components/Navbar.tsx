"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  TrendingUp,
  Settings,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useEffect, useRef, useState } from "react";
import {
  AUTH_CHANGED_EVENT,
  clearAuth,
  getCurrentUser,
  getStoredUser,
  getToken,
} from "@/lib/api";
import type { AuthUser } from "@/lib/api";

const landingNavLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
];

const appNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workouts", label: "Workouts" },
  { href: "/meals", label: "Meal Plan" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" },
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
    let isActive = true;

    const syncUser = async () => {
      const stored = getStoredUser();
      if (stored && isActive) {
        setUser(stored);
      }

      const token = getToken();
      if (token) {
        try {
          const current = await getCurrentUser();
          if (isActive && current) {
            setUser(current);
          }
        } catch {
          // ignore
        }
      }
      if (isActive) setMounted(true);
    };

    syncUser();
    window.addEventListener(AUTH_CHANGED_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      isActive = false;
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

  // Logo always directs to the landing page
  const logoHref = "/";

  // Check if session is authenticated (always true on app routes or if token/user exists)
  const isAuthenticated = isAppRoute || Boolean(user || (mounted && getToken()));
  const displayName = user?.fullName || user?.name || "Santanderjosephine24";

  const isActiveLink = (href: string) => {
    const normalizedPath = (pathname || "").replace(/\/+$/, "") || "/";
    const normalizedHref = href.replace(/\/+$/, "") || "/";

    if (normalizedHref === "/dashboard") {
      return normalizedPath === "/dashboard";
    }
    return normalizedPath.startsWith(normalizedHref);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - Kept fixed as requested */}
        <Link href={logoHref} className="flex items-center gap-3 group shrink-0">
          <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
            <BrandMark className="h-9 w-9 drop-shadow-sm" priority />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">Strive</span>
        </Link>

        {/* Center Navigation - Clean text color change without highlight box */}
        {isAppRoute ? (
          <nav aria-label="Main application navigation" className="hidden lg:flex items-center gap-7">
            {appNavLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`text-sm transition-colors duration-150 ${
                    active
                      ? "text-[#ed4f28] font-bold"
                      : "text-slate-600 hover:text-slate-950 font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                prefetch={true}
                className={`text-sm transition-colors duration-150 ${
                  pathname.startsWith("/admin")
                    ? "text-amber-600 font-bold"
                    : "text-slate-600 hover:text-slate-950 font-medium"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        ) : (
          <nav aria-label="Public navigation" className="hidden lg:flex items-center gap-6">
            {landingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Section: Single Unified Profile Trigger or Public Auth buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors group focus:outline-none cursor-pointer"
                aria-expanded={isProfileOpen}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs ring-1 ring-slate-200 shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-800 group-hover:text-slate-950 whitespace-nowrap">
                  {displayName}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-150 ${
                    isProfileOpen ? "rotate-180 text-slate-700" : ""
                  }`}
                />
              </button>

              {/* Polished Dropdown Popover */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200/80 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {displayName}
                    </p>
                    {user?.email && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    )}
                  </div>

                  <div className="space-y-0.5 py-0.5">
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/progress"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 rounded-xl transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span>Fitness Progress</span>
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                      }}
                      className="flex items-center w-full gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 px-4 py-1.5 rounded-lg shadow-xs active:scale-95 transition-all"
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

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 sm:px-6 py-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {displayName}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {user?.email || (user?.role === "admin" ? "Administrator" : "Member")}
                  </span>
                </div>
              </div>

              {appNavLinks.map((link) => {
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block text-sm py-2 px-1 font-medium transition-colors ${
                      active
                        ? "text-[#ed4f28] font-bold"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className={`block text-sm py-2 px-1 font-medium transition-colors ${
                    pathname.startsWith("/admin")
                      ? "text-amber-600 font-bold"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex items-center w-full text-sm font-semibold text-rose-600 hover:bg-rose-50 p-2 rounded-lg gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
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
                  className="block text-sm font-medium text-slate-700 hover:text-slate-950 py-2 px-3 rounded-lg hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  href="/login"
                  className="block text-center text-sm font-medium text-slate-700 py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-center text-sm font-semibold text-white bg-slate-950 py-2.5 px-4 rounded-lg hover:bg-slate-800"
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
