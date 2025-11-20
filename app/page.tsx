"use client";

import Link from "next/link";
import {
  Package,
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  Layers,
  Calculator,
} from "lucide-react";

export default function HomePage() {
  const menu = [
    {
      name: "Inventory",
      href: "/inventory",
      icon: <Package className="w-8 h-8" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Sales / Billing",
      href: "/sales",
      icon: <ShoppingCart className="w-8 h-8" />,
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Purchases",
      href: "/purchase",
      icon: <ClipboardList className="w-8 h-8" />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      name: "Adjustments",
      href: "/adjustments",
      icon: <Layers className="w-8 h-8" />,
      color: "bg-purple-100 text-purple-700",
    },
    {
      name: "Expenses",
      href: "/pr",
      icon: <Calculator className="w-8 h-8" />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      name: "P&L Dashboard",
      href: "/dashboard",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">POS Menu</h1>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto">

        {menu.map((m) => (
          <Link
            key={m.name}
            href={m.href}
            className="p-5 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center hover:shadow-md transition border"
          >
            <div className={`${m.color} rounded-full p-4 mb-3`}>
              {m.icon}
            </div>
            <span className="font-semibold text-center">{m.name}</span>
          </Link>
        ))}

      </div>
    </div>
  );
}
