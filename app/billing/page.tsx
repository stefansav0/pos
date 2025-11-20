"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import {
    Minus,
    Plus,
    Trash2,
    Search,
    User,
    SmartphoneCharging,
} from "lucide-react";

/* ------------------ TYPES ------------------ */
type InventoryItem = {
    _id?: string;
    itemName: string;
    avgCostPerUnit?: number;
    unitsAvailable?: number;
    sellingPrice?: number;
};

type CartItem = {
    id: string;
    itemName: string;
    qty: number;
    price: number;
};

/* ------------------ MAIN PAGE ------------------ */
export default function BillingPage() {
    const [menuItems, setMenuItems] = useState<InventoryItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState("");
    const [selectedMode, setSelectedMode] = useState<"TABLE" | "TAKEOUT" | "DELIVERY">("TABLE");
    const [discount, setDiscount] = useState<number>(0);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [waiterName, setWaiterName] = useState("");

    /* ------------------ LOAD MENU ------------------ */
    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        const inv = await apiGet("/api/inventory");
        setMenuItems(inv || []);
    };

    /* ------------------ CART LOGIC ------------------ */
    const addToCart = (item: InventoryItem) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.itemName === item.itemName);
            if (existing) {
                return prev.map((c) =>
                    c.itemName === item.itemName ? { ...c, qty: c.qty + 1 } : c
                );
            }
            const defaultPrice = item.sellingPrice ?? 100;
            return [
                ...prev,
                {
                    id: `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    itemName: item.itemName,
                    qty: 1,
                    price: defaultPrice,
                },
            ];
        });
    };

    const changeQty = (id: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((c) =>
                    c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c
                )
                .filter((c) => c.qty > 0)
        );
    };

    const changePrice = (id: string, price: number) => {
        setCart((prev) =>
            prev.map((c) => (c.id === id ? { ...c, price: Math.max(0, price) } : c))
        );
    };

    const removeItem = (id: string) => {
        setCart((prev) => prev.filter((c) => c.id !== id));
    };

    /* ------------------ TOTALS ------------------ */
    const { subtotal, totalQty, grandTotal } = useMemo(() => {
        const sub = cart.reduce((sum, c) => sum + c.qty * c.price, 0);
        const qty = cart.reduce((sum, c) => sum + c.qty, 0);
        const total = Math.max(0, sub - (discount || 0));
        return { subtotal: sub, totalQty: qty, grandTotal: total };
    }, [cart, discount]);

    const filteredMenu = useMemo(() => {
        const s = search.toLowerCase().trim();
        if (!s) return menuItems;
        return menuItems.filter((m) => m.itemName.toLowerCase().includes(s));
    }, [menuItems, search]);

    /* ------------------ BILLING ------------------ */
    const handleBilling = async () => {
        if (cart.length === 0) {
            alert("No items in bill");
            return;
        }

        const billData = {
            cart,
            customerName,
            customerPhone,
            waiterName,
            discount,
            total: grandTotal,
            mode: selectedMode,
            createdAt: new Date(),
        };

        try {
            const res = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(billData),
            });
            if (res.ok) {
                alert(`Bill saved. Total: ₹${grandTotal.toFixed(2)}`);
                setCart([]);
                setCustomerName("");
                setCustomerPhone("");
                setWaiterName("");
                setDiscount(0);
            } else {
                alert("Failed to save bill");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving bill");
        }
    };

    /* ------------------ UI ------------------ */
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top bar */}
            <header className="w-full bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                            P
                        </div>
                        <span className="font-semibold text-lg">POS Billing</span>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" /> {waiterName || "Waiter not set"}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700">
                            {selectedMode === "TABLE"
                                ? "Table Service"
                                : selectedMode === "TAKEOUT"
                                    ? "Take Out"
                                    : "Delivery"}
                        </span>
                    </div>
                </div>

                {/* Modes */}
                <div className="bg-slate-800">
                    <div className="max-w-7xl mx-auto flex">
                        {(
                            [
                                { key: "TABLE", label: "Table" },
                                { key: "TAKEOUT", label: "Take Out" },
                                { key: "DELIVERY", label: "Delivery" },
                            ] as const
                        ).map((mode) => (
                            <button
                                key={mode.key}
                                onClick={() => setSelectedMode(mode.key)}
                                className={`flex-1 py-2 text-sm font-medium border-r border-slate-700 ${selectedMode === mode.key
                                    ? "bg-teal-500 text-white"
                                    : "text-gray-100 hover:bg-slate-700"
                                    }`}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main layout */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 lg:py-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* LEFT: Menu */}
                    <section className="flex-1 bg-white rounded-lg shadow-sm border p-3 sm:p-4 flex flex-col">
                        {/* Search + categories row */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-3">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                                    placeholder="Search item..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Menu Grid */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredMenu.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm mt-6">
                                    No items found. Add items in Inventory.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                    {filteredMenu.map((item) => (
                                        <button
                                            key={item._id ?? item.itemName}
                                            onClick={() => addToCart(item)}
                                            className="h-16 sm:h-20 text-xs sm:text-sm border rounded-md bg-slate-50 hover:bg-teal-50 flex items-center justify-center text-center px-2"
                                        >
                                            {item.itemName}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* RIGHT: Bill Panel */}
                    <section className="w-full lg:w-80 xl:w-96 bg-white rounded-lg shadow-sm border flex flex-col">
                        {/* Bill Header */}
                        <div className="border-b px-3 py-2 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">Bill Detail</div>
                                <div className="text-sm font-semibold">
                                    Items: {totalQty} • Total: ₹{grandTotal.toFixed(2)}
                                </div>
                            </div>
                            <button
                                className="text-xs text-red-500"
                                onClick={() => setCart([])}
                            >
                                Clear
                            </button>
                        </div>

                        {/* Cart list */}
                        <div className="flex-1 overflow-y-auto px-2 py-2">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm mt-4">
                                    No items in bill.
                                </div>
                            ) : (
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="border px-1 py-1 text-left">Item</th>
                                            <th className="border px-1 py-1 text-center">Qty</th>
                                            <th className="border px-1 py-1 text-right">Rate</th>
                                            <th className="border px-1 py-1 text-right">Amt</th>
                                            <th className="border px-1 py-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((c) => (
                                            <tr key={c.id}>
                                                <td className="border px-1 py-1 align-top">
                                                    <div className="text-[11px] font-medium">{c.itemName}</div>
                                                </td>
                                                <td className="border px-1 py-1 align-top">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            className="w-5 h-5 flex items-center justify-center border rounded"
                                                            onClick={() => changeQty(c.id, -1)}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-6 text-center text-[11px]">{c.qty}</span>
                                                        <button
                                                            className="w-5 h-5 flex items-center justify-center border rounded"
                                                            onClick={() => changeQty(c.id, 1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="border px-1 py-1 align-top text-right">
                                                    <input
                                                        type="number"
                                                        className="w-16 text-right text-[11px] border rounded px-1 py-0.5"
                                                        value={c.price}
                                                        onChange={(e) =>
                                                            changePrice(c.id, Number(e.target.value) || 0)
                                                        }
                                                    />
                                                </td>
                                                <td className="border px-1 py-1 align-top text-right text-[11px]">
                                                    ₹{(c.qty * c.price).toFixed(2)}
                                                </td>
                                                <td className="border px-1 py-1 align-top text-center">
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => removeItem(c.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Totals & discount */}
                        <div className="border-t px-3 py-2 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span>Discount</span>
                                <input
                                    type="number"
                                    className="w-20 border rounded px-1 py-0.5 text-right"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex justify-between font-semibold text-sm pt-1 border-t mt-1">
                                <span>Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Customer / UPI / Billing */}
                        <div className="border-t px-3 py-2 text-xs space-y-2">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-0.5">
                                        <User className="w-3 h-3" /> Customer
                                    </div>
                                    <input
                                        className="w-full border rounded px-2 py-1 text-[11px]"
                                        placeholder="Name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-0.5">
                                        <Search className="w-3 h-3" /> Phone
                                    </div>
                                    <input
                                        className="w-full border rounded px-2 py-1 text-[11px]"
                                        placeholder="Mobile"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="text-[11px] text-gray-600 mb-0.5">Waiter / Delivery Boy</div>
                                <input
                                    className="w-full border rounded px-2 py-1 text-[11px]"
                                    placeholder="Enter name"
                                    value={waiterName}
                                    onChange={(e) => setWaiterName(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 items-center mt-1">
                                <div className="flex-1 border rounded-md p-2 flex items-center gap-2">
                                    <SmartphoneCharging className="w-5 h-5 text-teal-600" />
                                    <div className="text-[11px]">
                                        <div className="font-semibold">UPI Payment</div>
                                        <div className="text-gray-600">
                                            Scan QR and pay ₹{grandTotal.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-16 h-16 border rounded-md flex items-center justify-center text-[10px] text-gray-500">QR</div>
                            </div>
                        </div>

                        {/* Billing button */}
                        <div className="border-t px-3 py-3 bg-slate-50">
                            <button
                                onClick={handleBilling}
                                className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">₹</span>
                                <span>Billing • ₹{grandTotal.toFixed(2)}</span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
