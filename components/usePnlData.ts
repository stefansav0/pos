"use client";

import { useEffect, useMemo, useState } from "react";

/* TYPES — correct */
type Purchase = {
    _id: string;
    itemName: string;
    totalUnitsProduced: number;
    costPerUnit: number;
    travelCost?: number;
    createdAt: string;
};

type Sale = {
    _id: string;
    itemName: string;
    qtySold: number;
    sellingPricePerUnit: number;
    deliveryCost: number;
    packagingCost: number;
    cogsTotal: number;
    revenueTotal: number;
    profitTotal: number;
    unitCostBeforeExtras: number;
    createdAt: string;
};

type InventoryItem = {
    _id: string;
    itemName: string;
    unitsAvailable: number;
    avgCostPerUnit: number;
    updatedAt: string;
};

type Adjustment = {
    _id: string;
    itemName: string;
    qty: number;
    reason: string;
    createdAt: string;
};

type Expense = {
    _id: string;
    category: string;
    amount: number;
    date: string;
    notes?: string | null;
    createdAt: string;
};

export function usePnlData() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    /* ========== SAFE FETCH WRAPPER ========== */
    const safeFetch = async (url: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`API FAILED ${url}:`, res.status);
                return [];
            }
            return await res.json();
        } catch (err) {
            console.error("Network error:", err);
            return [];
        }
    };

    /* ========== LOAD ALL DATA ========== */
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [p, s, i, a, e] = await Promise.all([
                safeFetch("/api/purchases"),
                safeFetch("/api/sales"),
                safeFetch("/api/inventory"),
                safeFetch("/api/adjustments"),
                safeFetch("/api/expenses"),
            ]);

            setPurchases(p);
            setSales(s);
            setInventory(i);
            setAdjustments(a);
            setExpenses(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    /* ========== EVENTS LOGIC ========== */
    const events = useMemo(() => {
        const ev: { date: string; type: string; amount: number }[] = [];

        sales.forEach((s) => {
            ev.push({ date: s.createdAt, type: "SALE_REVENUE", amount: s.revenueTotal });
            ev.push({ date: s.createdAt, type: "SALE_COGS", amount: s.cogsTotal });
        });

        purchases.forEach((p) => {
            const travel = Number(p.travelCost || 0);
            if (travel > 0)
                ev.push({ date: p.createdAt, type: "PURCHASE_TRAVEL", amount: travel });
        });

        adjustments.forEach((a) => {
            if (a.qty < 0) {
                const inv = inventory.find((i) => i.itemName === a.itemName);
                const cost = Math.abs(a.qty) * (inv?.avgCostPerUnit || 0);
                ev.push({ date: a.createdAt, type: "DAMAGE_LOSS", amount: cost });
            }
        });

        expenses.forEach((ex) => {
            ev.push({
                date: ex.createdAt || ex.date,
                type: "GENERAL_EXPENSE",
                amount: ex.amount,
            });
        });

        return ev.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [sales, purchases, adjustments, expenses, inventory]);

    /* ========== GROUP BY PERIOD ========== */
    const groupByPeriod = (period: "day" | "month" | "year") => {
        const map = new Map<
            string,
            { date: string; revenue: number; cogs: number; opExpenses: number; profit: number }
        >();

        const ensure = (k: string) => {
            if (!map.has(k)) {
                map.set(k, { date: k, revenue: 0, cogs: 0, opExpenses: 0, profit: 0 });
            }
            return map.get(k)!;
        };

        sales.forEach((s) => {
            const d = new Date(s.createdAt);
            const key =
                period === "day"
                    ? d.toISOString().slice(0, 10)
                    : period === "month"
                        ? d.toISOString().slice(0, 7)
                        : d.getFullYear().toString();

            const row = ensure(key);
            row.revenue += s.revenueTotal;
            row.cogs += s.cogsTotal;
            row.profit += s.revenueTotal - s.cogsTotal;
        });

        events.forEach((ev) => {
            const d = new Date(ev.date);
            const key =
                period === "day"
                    ? d.toISOString().slice(0, 10)
                    : period === "month"
                        ? d.toISOString().slice(0, 7)
                        : d.getFullYear().toString();

            const row = ensure(key);

            if (["PURCHASE_TRAVEL", "DAMAGE_LOSS", "GENERAL_EXPENSE"].includes(ev.type)) {
                row.opExpenses += ev.amount;
                row.profit -= ev.amount;
            }
        });

        return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
    };

    return {
        purchases,
        sales,
        inventory,
        adjustments,
        expenses,
        events,
        daily: groupByPeriod("day"),
        monthly: groupByPeriod("month"),
        yearly: groupByPeriod("year"),
        loading,
        refreshAll: fetchAll,
    };
}
