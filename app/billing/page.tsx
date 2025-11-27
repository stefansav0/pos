"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

/* COMPONENTS */
import BillingHeader from "@/components/billing/BillingHeader";
import BillingModes from "@/components/billing/BillingModes";
import MenuSearch from "@/components/billing/MenuSearch";
import MenuGrid from "@/components/billing/MenuGrid";
import BillPanel from "@/components/billing/BillPanel";

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

type ModeType = "TABLE" | "TAKEOUT" | "DELIVERY";

export default function BillingPage() {
    const [menuItems, setMenuItems] = useState<InventoryItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [search, setSearch] = useState<string>("");
    const [selectedMode, setSelectedMode] = useState<ModeType>("TABLE");
    const [discount, setDiscount] = useState<number>(0);
    const [customerName, setCustomerName] = useState<string>("");
    const [customerPhone, setCustomerPhone] = useState<string>("");
    const [waiterName, setWaiterName] = useState<string>("");

    /* ------------------ LOAD MENU ------------------ */
    const loadMenu = async () => {
        const inv = await apiGet("/api/inventory");
        setMenuItems(inv || []);
    };

    useEffect(() => {
        loadMenu();
    }, []);

    /* ------------------ CART ACTIONS ------------------ */
    const addToCart = (item: InventoryItem) => {
        setCart((prev: CartItem[]) => {
            const existing = prev.find((c) => c.itemName === item.itemName);
            if (existing) {
                return prev.map((c) =>
                    c.itemName === item.itemName ? { ...c, qty: c.qty + 1 } : c
                );
            }

            const defaultPrice = item.sellingPrice ?? 200;

            return [
                ...prev,
                {
                    id: `cart_${Date.now()}_${Math.random()}`,
                    itemName: item.itemName,
                    qty: 1,
                    price: defaultPrice,
                },
            ];
        });
    };

    const changeQty = (id: string, delta: number) => {
        setCart((prev: CartItem[]) =>
            prev
                .map((c) =>
                    c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c
                )
                .filter((c) => c.qty > 0)
        );
    };

    const changePrice = (id: string, price: number) => {
        setCart((prev: CartItem[]) =>
            prev.map((c) => (c.id === id ? { ...c, price: Math.max(0, price) } : c))
        );
    };

    const removeItem = (id: string) => {
        setCart((prev: CartItem[]) => prev.filter((c) => c.id !== id));
    };

    /* ------------------ TOTALS ------------------ */
    const { subtotal, totalQty, grandTotal } = useMemo(() => {
        const sub = cart.reduce((sum, c) => sum + c.qty * c.price, 0);
        const qty = cart.reduce((sum, c) => sum + c.qty, 0);

        return {
            subtotal: sub,
            totalQty: qty,
            grandTotal: Math.max(0, sub - discount),
        };
    }, [cart, discount]);

    /* ------------------ FILTERED MENU ------------------ */
    const filteredMenu = useMemo<InventoryItem[]>(() => {
        const s = search.toLowerCase().trim();
        if (!s) return menuItems;
        return menuItems.filter((m) => m.itemName.toLowerCase().includes(s));
    }, [menuItems, search]);

    /* ------------------ BILLING HANDLER ------------------ */
    const handleBilling = async () => {
        await apiPost("/api/sales", {
            items: cart.map((c) => ({
                itemName: c.itemName,
                qty: c.qty,
                price: c.price,
            })),
            subtotal,
            discount,
            total: grandTotal,
            customerName,
            customerPhone,
            waiterName,
            mode: selectedMode,
            createdAt: new Date().toISOString(),
        });

        alert("Bill saved successfully!");

        // Reset bill
        setCart([]);
        setDiscount(0);
        setCustomerName("");
        setCustomerPhone("");
    };

    /* ------------------ UI ------------------ */
    return (
        <div className="min-h-screen bg-gray-100">
            <BillingHeader waiterName={waiterName} selectedMode={selectedMode} />

            <BillingModes selectedMode={selectedMode} setSelectedMode={setSelectedMode} />

            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 lg:py-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* LEFT MENU */}
                    <section className="flex-1 bg-white rounded-lg shadow-sm border p-3 sm:p-4 flex flex-col">
                        <MenuSearch search={search} setSearch={setSearch} />
                        <MenuGrid menu={filteredMenu} addToCart={addToCart} />
                    </section>

                    {/* RIGHT PANEL */}
                    <BillPanel
                        cart={cart}
                        changeQty={changeQty}
                        changePrice={changePrice}
                        removeItem={removeItem}
                        totalQty={totalQty}
                        subtotal={subtotal}
                        discount={discount}
                        setDiscount={setDiscount}
                        grandTotal={grandTotal}
                        customerName={customerName}
                        setCustomerName={setCustomerName}
                        customerPhone={customerPhone}
                        setCustomerPhone={setCustomerPhone}
                        waiterName={waiterName}
                        setWaiterName={setWaiterName}
                        handleBilling={handleBilling}
                        clearCart={() => setCart([])}
                    />
                </div>
            </main>
        </div>
    );
}
