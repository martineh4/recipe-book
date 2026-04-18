"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/recipes", label: "All Recipes" },
    { href: "/recipes/new", label: "+ Add Recipe" },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg text-stone-800 tracking-tight">
          📖 Recipe Book
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-stone-100 text-stone-900"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
