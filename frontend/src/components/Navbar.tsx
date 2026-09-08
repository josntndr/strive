"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useEffect, useState } from "react";
import { AUTH_CHANGED_EVENT, clearAuth, getStoredUser, getToken } from "@/lib/api";
import type { AuthUser } from "@/lib/api";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
];

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 group">
    <BrandMark className="h-7 w-7 text-blue-600" />
    <span className="text-xl font-extrabold tracking-tight text-slate-900">Strive</span>
  </Link>
);

export const Navbar = () => {
  const router = useRouter();
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

  if (!mounted) {
    return (
      <nav className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Logo />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <Logo />

          {/* Centered desktop navigation */}
          <div className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-all duration-150 hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-white bg-blue-600 px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shadow-inner">
                    {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 font-semibold max-w-[140px] truncate">{user.fullName || user.name}</span>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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

          {/* Mobile menu button */}
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
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 py-4 px-4 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-semibold text-slate-700 hover:text-blue-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="block text-base font-semibold text-white bg-blue-600 px-4 py-2.5 rounded-full text-center hover:bg-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center w-full text-base font-medium text-slate-600 hover:text-blue-600 py-2 gap-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </nav>
  );
};
