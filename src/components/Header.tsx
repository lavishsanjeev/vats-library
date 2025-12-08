'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { BookOpen, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-[#0a0a1f]/70 backdrop-blur-xl border border-white/10 rounded-full px-6 h-16 flex items-center justify-between shadow-lg shadow-black/20 relative">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-primary transition-colors duration-300">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Vats Library</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white hover:scale-105 transition-all duration-300">Home</Link>
            <Link href="/#benefits" className="hover:text-white hover:scale-105 transition-all duration-300">Benefits</Link>
            <Link href="/#pricing" className="hover:text-white hover:scale-105 transition-all duration-300">Pricing</Link>
            <Link href="/#rules" className="hover:text-white hover:scale-105 transition-all duration-300">Rules</Link>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="hidden md:block bg-white text-black hover:bg-gray-100 h-10 px-8 py-2.5 rounded-full text-base font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105"
                  >
                    Sign In
                  </Link>

                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors mr-4"
                  >
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && mounted && (
          <div className="absolute top-24 left-4 right-4 bg-[#0a0a1f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
            <div className="flex flex-col gap-3 mt-2">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="w-full bg-white text-black hover:bg-gray-100 h-12 rounded-xl flex items-center justify-center font-semibold text-lg shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>

              </SignedOut>
              <SignedIn>
                {pathname === '/dashboard' ? (
                  <Link
                    href="/"
                    className="w-full bg-white/10 text-white hover:bg-white/20 h-10 rounded-xl flex items-center justify-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home Page
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="w-full bg-primary/20 text-primary hover:bg-primary/30 h-10 rounded-xl flex items-center justify-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                )}
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
