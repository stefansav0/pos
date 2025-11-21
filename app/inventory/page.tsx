"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

import InventorySummary from "@/components/inventory/InventorySummary";
import InventoryTable from "@/components/inventory/InventoryTable";
import MovementHistory from "@/components/inventory/MovementHistory";

/* ------------------ TYPES ------------------ */
type InventoryItem = {
    _id: string;
    itemName: string;
    unitsAvailable: number;
    avgCostPerUnit: number;
    updatedAt: string;
};

type Purchase = {
    _id: string;
    itemName: string;
    totalUnitsProduced: number;
    costPerUnit: number;
    createdAt: string;
};

type SaleRecord = {
    _id: string;
    itemName: string;
    qtySold: number;
    revenueTotal: number;
    cogsTotal: number;
    createdAt: string;
};

type Adjustment = {
    _id: string;
    itemName: string;
    qty: number;
    reason: string;
    createdAt: string;
};

type HistoryRow = {
    _id: string;
    type: "PURCHASE" | "SALE" | "ADJUSTMENT";
    itemName: string;
    qty: number;
    date: string;
    extra?: string;
};

/* ==========================================================
                MAIN INVENTORY PAGE
========================================================== */

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

    const [historyFilter, setHistoryFilter] = useState<
        "ALL" | "PURCHASE" | "SALE" | "ADJUSTMENT"
    >("ALL");

    /* ---------- LOAD EVERYTHING ---------- */
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        const [inv, pur, sal, adj] = await Promise.all([
            apiGet("/api/inventory"),
            apiGet("/api/purchases"),
            apiGet("/api/sales"),
            apiGet("/api/adjustments"),
        ]);

        setInventory(inv);
        setPurchases(pur);
        setSales(sal);
        setAdjustments(adj);
    };

    /* ==========================================================
                        DELETE HISTORY ROW
    ========================================================== */
    const deleteHistory = async (row: HistoryRow) => {
        if (!confirm("Delete this entry? This cannot be undone.")) return;

        /* ----- DELETE PURCHASE ----- */
        if (row.type === "PURCHASE") {
            await fetch(`/api/purchases?id=${row._id}`, { method: "DELETE" });

            // rollback inventory
            const inv = inventory.find((i) => i.itemName === row.itemName);
            if (inv) {
                await apiPost("/api/inventory", {
                    itemName: inv.itemName,
                    unitsAvailable: inv.unitsAvailable - row.qty,
                    avgCostPerUnit: inv.avgCostPerUnit,
                });
            }
        }

        /* ----- DELETE SALE ----- */
        if (row.type === "SALE") {
            await fetch(`/api/sales?id=${row._id}`, { method: "DELETE" });

            // rollback inventory
            const inv = inventory.find((i) => i.itemName === row.itemName);
            if (inv) {
                await apiPost("/api/inventory", {
                    itemName: inv.itemName,
                    unitsAvailable: inv.unitsAvailable + Math.abs(row.qty),
                    avgCostPerUnit: inv.avgCostPerUnit,
                });
            }
        }

        /* ----- DELETE ADJUSTMENT ----- */
        if (row.type === "ADJUSTMENT") {
            await fetch(`/api/adjustments?id=${row._id}`, { method: "DELETE" });

            // reverse adjustment qty
            const inv = inventory.find((i) => i.itemName === row.itemName);
            if (inv) {
                await apiPost("/api/inventory", {
                    itemName: inv.itemName,
                    unitsAvailable: inv.unitsAvailable - row.qty,
                    avgCostPerUnit: inv.avgCostPerUnit,
                });
            }
        }

        await loadAll();
    };

    /* ==========================================================
                        MOVEMENT HISTORY
    ========================================================== */
    const movementHistory = useMemo<HistoryRow[]>(() => {
        const rows: HistoryRow[] = [];

        purchases.forEach((p) =>
            rows.push({
                _id: p._id,
                type: "PURCHASE",
                itemName: p.itemName,
                qty: p.totalUnitsProduced,
                date: p.createdAt,
                extra: `Cost/Unit: ₹${p.costPerUnit}`,
            })
        );

        sales.forEach((s) =>
            rows.push({
                _id: s._id,
                type: "SALE",
                itemName: s.itemName,
                qty: -s.qtySold,
                date: s.createdAt,
                extra: `Revenue: ₹${s.revenueTotal}`,
            })
        );

        adjustments.forEach((a) =>
            rows.push({
                _id: a._id,
                type: "ADJUSTMENT",
                itemName: a.itemName,
                qty: a.qty,
                date: a.createdAt,
                extra: a.reason,
            })
        );

        return rows.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [purchases, sales, adjustments]);

    const filteredHistory = useMemo(() => {
        if (historyFilter === "ALL") return movementHistory;
        return movementHistory.filter((row) => row.type === historyFilter);
    }, [historyFilter, movementHistory]);

    /* ==========================================================
                        UI
    ========================================================== */

    const totalValue = inventory.reduce(
        (s, it) => s + it.unitsAvailable * it.avgCostPerUnit,
        0
    );

    const exportCSV = () => {
        let csv = "Item,Units,AvgCost,Value\n";
        inventory.forEach((it) => {
            csv += `${it.itemName},${it.unitsAvailable},${it.avgCostPerUnit},${it.unitsAvailable * it.avgCostPerUnit
                }\n`;
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "inventory.csv";
        a.click();
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>

            <InventorySummary inventory={inventory} totalValue={totalValue} />

            <InventoryTable inventory={inventory} exportCSV={exportCSV} />

            {/* History Filter */}
            <div className="my-6">
                <label className="font-medium mr-3">Filter History:</label>
                <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value as any)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="ALL">All</option>
                    <option value="PURCHASE">Purchases</option>
                    <option value="SALE">Sales</option>
                    <option value="ADJUSTMENT">Adjustments</option>
                </select>
            </div>

            <MovementHistory
                movementHistory={filteredHistory}
                deleteHistory={deleteHistory}
            />
        </div>
    );
}
