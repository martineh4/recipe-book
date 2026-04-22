"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "Home" },
    { href: "/recipes", label: "All Recipes" },
    { href: "/favorites", label: "Favorites" },
    { href: "/recipes/new", label: "+ Add Recipe" },
  ];

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg text-stone-800 tracking-tight">
          📖 Recipe Book
        </Link>
        <div className="flex items-center gap-1">
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

          <div className="ml-3 pl-3 border-l border-stone-200 flex items-center gap-2">
            {session?.user ? (
              <>
                <span className="text-sm text-stone-600 hidden sm:block">
                  {session.user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-stone-500 hover:text-stone-800 px-2 py-1 rounded transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-stone-600 hover:text-stone-900 px-2 py-1 rounded transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
