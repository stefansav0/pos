"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/" },
        { name: "Purchase", href: "/purchase" },
        { name: "Sales", href: "/sales" },
        { name: "Inventory", href: "/inventory" },
        { name: "Expenses", href: "/pr" },
    ];

    return (
        <nav className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold">P&L</h1>

                <div className="hidden md:flex gap-6">
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`font-medium transition ${pathname === l.href
                                ? "text-blue-600 font-semibold"
                                : "text-gray-700"
                                }`}
                        >
                            {l.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
