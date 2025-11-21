import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-[#0a0a1f]/70 backdrop-blur-xl border border-white/10 rounded-full px-6 h-16 flex items-center justify-between shadow-lg shadow-black/20">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-primary transition-colors duration-300">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Vats Library</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white hover:scale-105 transition-all duration-300">Home</Link>
            <Link href="/#benefits" className="hover:text-white hover:scale-105 transition-all duration-300">Benefits</Link>
            <Link href="/#pricing" className="hover:text-white hover:scale-105 transition-all duration-300">Pricing</Link>
            <Link href="/#rules" className="hover:text-white hover:scale-105 transition-all duration-300">Rules</Link>
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-white text-black hover:bg-gray-100 h-9 px-6 py-2 rounded-full text-sm font-medium transition-all shadow-md"
              >
                Join Now
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors mr-4"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
