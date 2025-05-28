"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-50 flex justify-between items-center py-4 px-6 bg-background/80 border-b border-border backdrop-blur-xl">
      <Link href="/" className="flex items-center">
        <Image 
          src="/logo-smol-coloured.png"
          alt="MegaETH"
          width={50}
          height={50}
          className="drop-shadow-sm hover:drop-shadow-md transition-all duration-300"
        />
      </Link>

      <div className="flex items-center gap-6">
        <Link 
          href="/feedback" 
          className="text-sm font-mono hover:text-primary transition-colors duration-200"
        >
          VIEW FEEDBACK
        </Link>
        
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-accent hover:cursor-pointer rounded-md transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        )}

        <w3m-button />
      </div>
    </nav>
  );
}