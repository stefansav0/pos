"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <h1 className="text-xl font-bold">LaRa Management</h1>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-6">
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`font-medium transition ${pathname === l.href
                                ? "text-blue-600 font-semibold"
                                : "text-gray-700"
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {l.name}
                        </Link>
                    ))}
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {/* Hamburger icon */}
                    <svg
                        className="w-6 h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {mobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t shadow-sm">
                    <div className="flex flex-col px-4 py-2 space-y-1">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`block font-medium py-2 transition ${pathname === l.href
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-700 hover:text-blue-600"
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {l.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
