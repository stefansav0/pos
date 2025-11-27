"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import * as XLSX from "xlsx";

/* ---------- TYPES ---------- */
type UnitType = "KG" | "UNIT";

type Purchase = {
    _id?: string;
    itemName: string;
    unitType: UnitType;
    qty: number;
    purchaseCost: number;
    packagingCost: number;
    containersPerKg?: number;
    totalUnitsProduced: number;
    costPerUnit: number;
    notes?: string;
    createdAt: string;
};

type InventoryItem = {
    _id?: string;
    itemName: string;
    unitsAvailable: number;
    avgCostPerUnit: number;
    updatedAt: string;
};

/* ---------- MAIN COMPONENT ---------- */
export default function PurchasePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    /* ---------- FORM STATE ---------- */
    const [itemName, setItemName] = useState("");
    useEffect(() => {
        loadAll();
    }, []);

    const [unitType, setUnitType] = useState<UnitType>("KG");
    const [qty, setQty] = useState(1);
    const [purchaseCost, setPurchaseCost] = useState(0);
    const [packagingCost, setPackagingCost] = useState(0);
    const [containersPerKg, setContainersPerKg] = useState(5);
    const [notes, setNotes] = useState("");

    /* ---------- LOAD FROM MONGO ---------- */
    const loadAll = async () => {
        const [p, inv] = await Promise.all([
            apiGet("/api/purchases"),
            apiGet("/api/inventory"),
        ]);

        setPurchases(p);
        setInventory(inv);
    };

    /* ---------- CALCULATE ---------- */
    const computeProducedAndCost = () => {
        const totalUnits =
            unitType === "KG" ? qty * containersPerKg : qty;

        const totalCost = purchaseCost + packagingCost;
        const costPerUnit = totalUnits > 0 ? totalCost / totalUnits : 0;

        return { totalUnits, costPerUnit };
    };

    /* ==========================================================
                        UPDATE INVENTORY (Weighted Avg)
    =========================================================== */
    const updateInventory = async (name: string, totalUnits: number, costPerUnit: number) => {
        const existing = inventory.find(
            (i) => i.itemName.toLowerCase() === name.toLowerCase()
        );

        if (!existing) {
            await apiPost("/api/inventory", {
                itemName: name,
                unitsAvailable: totalUnits,
                avgCostPerUnit: costPerUnit,
            });
            return;
        }

        const newUnits = existing.unitsAvailable + totalUnits;
        const newAvg =
            (existing.avgCostPerUnit * existing.unitsAvailable +
                costPerUnit * totalUnits) /
            newUnits;

        await apiPost("/api/inventory", {
            itemName: name,
            unitsAvailable: newUnits,
            avgCostPerUnit: newAvg,
        });
    };

    /* ==========================================================
                       ADD SINGLE PURCHASE
    =========================================================== */
    const onAddPurchase = async () => {
        if (!itemName.trim()) return alert("Enter item name");
        if (qty <= 0) return alert("Enter valid quantity");

        const { totalUnits, costPerUnit } = computeProducedAndCost();

        const newPurchase: Purchase = {
            itemName: itemName.trim(),
            unitType,
            qty,
            purchaseCost,
            packagingCost,
            containersPerKg: unitType === "KG" ? containersPerKg : undefined,
            totalUnitsProduced: totalUnits,
            costPerUnit,
            notes: notes || "",
            createdAt: new Date().toISOString(),
        };

        await apiPost("/api/purchases", newPurchase);

        await updateInventory(itemName.trim(), totalUnits, costPerUnit);

        await loadAll();

        setQty(1);
        setPurchaseCost(0);
        setPackagingCost(0);
        setNotes("");
    };

    /* ==========================================================
                           DELETE PURCHASE
    =========================================================== */
    const deletePurchase = async (id: string) => {
        if (!confirm("Delete purchase? Inventory will NOT rollback.")) return;
        await fetch(`/api/purchases?id=${id}`, { method: "DELETE" });
        await loadAll();
    };

    const deleteInventoryItem = async (name: string) => {
        if (!confirm("Delete inventory item?")) return;
        await fetch(`/api/inventory?name=${name}`, { method: "DELETE" });
        await loadAll();
    };

    /* ==========================================================
                       SUMMARY VALUES
    =========================================================== */
    const totalInventoryValue = inventory.reduce(
        (s, it) => s + it.unitsAvailable * it.avgCostPerUnit,
        0
    );

    const totalUnitsAcrossInventory = inventory.reduce(
        (s, it) => s + it.unitsAvailable,
        0
    );

    /* ==========================================================
                      EXCEL EXPORT TEMPLATE
    =========================================================== */
    const exportExcel = () => {
        const headers = [
            [
                "Item Name",
                "Unit Type (KG/UNIT)",
                "Qty",
                "Purchase Cost",
                "Packaging Cost",
                "Containers Per KG",
                "Notes",
            ],
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(headers);

        XLSX.utils.book_append_sheet(wb, ws, "Template");

        XLSX.writeFile(wb, "Purchase_Template.xlsx");
    };

    /* ==========================================================
                      BULK IMPORT EXCEL
    =========================================================== */
    const importExcel = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);

        for (let r of rows) {
            const name = r["Item Name"]?.toString().trim();
            const type = (r["Unit Type (KG/UNIT)"] || "KG") as UnitType;
            const qty = Number(r["Qty"] || 0);
            const pc = Number(r["Purchase Cost"] || 0);
            const pkg = Number(r["Packaging Cost"] || 0);
            const cpk = Number(r["Containers Per KG"] || 5);
            const notes = r["Notes"] || "";

            if (!name || qty <= 0) continue;

            const totalUnits = type === "KG" ? qty * cpk : qty;
            const costPerUnit = totalUnits ? (pc + pkg) / totalUnits : 0;

            const purchaseData: Purchase = {
                itemName: name,
                unitType: type,
                qty,
                purchaseCost: pc,
                packagingCost: pkg,
                containersPerKg: type === "KG" ? cpk : undefined,
                totalUnitsProduced: totalUnits,
                costPerUnit,
                notes,
                createdAt: new Date().toISOString(),
            };

            await apiPost("/api/purchases", purchaseData);
            await updateInventory(name, totalUnits, costPerUnit);
        }

        alert("Bulk purchase imported.");
        await loadAll();
    };

    /* ==========================================================
                              UI
    =========================================================== */

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Purchase (MongoDB) — Add Item</h1>

            {/* Excel Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    onClick={exportExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Download Excel Template
                </button>

                <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
                    Import Excel
                    <input type="file" className="hidden" accept=".xlsx,.xls" onChange={importExcel} />
                </label>
            </div>

            {/* ---------------- FORM + INVENTORY ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* ---------------- FORM ---------------- */}
                <div className="p-4 border bg-white rounded">
                    <h2 className="font-semibold mb-3">Purchase Details</h2>

                    <label>Item name</label>
                    <input
                        className="w-full p-2 border rounded mb-3"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />

                    <label>Unit Type</label>
                    <select
                        className="w-full p-2 border rounded mb-3"
                        value={unitType}
                        onChange={(e) => setUnitType(e.target.value as UnitType)}
                    >
                        <option value="KG">KG (produces containers)</option>
                        <option value="UNIT">Unit (direct)</option>
                    </select>

                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            <label>{unitType === "KG" ? "Quantity (KG)" : "Quantity (Units)"}</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={qty}
                                onChange={(e) => setQty(+e.target.value)}
                            />
                        </div>

                        {unitType === "KG" && (
                            <div className="w-40">
                                <label>Containers / KG</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={containersPerKg}
                                    onChange={(e) => setContainersPerKg(+e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <label>Purchase Cost</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded mb-3"
                        value={purchaseCost}
                        onChange={(e) => setPurchaseCost(+e.target.value)}
                    />

                    <label>Packaging Cost</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded mb-3"
                        value={packagingCost}
                        onChange={(e) => setPackagingCost(+e.target.value)}
                    />

                    <label>Notes</label>
                    <input
                        className="w-full p-2 border rounded mb-3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    {/* ---------- PREVIEW ---------- */}
                    <div className="bg-gray-50 p-3 rounded mb-3 text-sm">
                        {(() => {
                            const { totalUnits, costPerUnit } = computeProducedAndCost();
                            return (
                                <>
                                    <div>Total Units Produced: <strong>{totalUnits}</strong></div>
                                    <div>Cost per Unit: <strong>₹{costPerUnit.toFixed(2)}</strong></div>
                                    <div>Total Cost: <strong>₹{(purchaseCost + packagingCost).toFixed(2)}</strong></div>
                                </>
                            );
                        })()}
                    </div>

                    <button
                        onClick={onAddPurchase}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Save Purchase
                    </button>
                </div>

                {/* ---------------- INVENTORY ---------------- */}
                <div className="p-4 border bg-white rounded">
                    <h2 className="font-semibold mb-3">Inventory Snapshot</h2>

                    <div className="text-sm mb-3">
                        <div>Total Items: {inventory.length}</div>
                        <div>Total Units: {totalUnitsAcrossInventory}</div>
                        <div>Inventory Value: ₹{totalInventoryValue.toFixed(2)}</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Item</th>
                                    <th className="p-2 border">Units</th>
                                    <th className="p-2 border">Avg Cost</th>
                                    <th className="p-2 border">Value</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {inventory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center p-3 text-gray-500">
                                            No inventory
                                        </td>
                                    </tr>
                                ) : (
                                    inventory.map((it) => (
                                        <tr key={it._id}>
                                            <td className="p-2 border">{it.itemName}</td>
                                            <td className="p-2 border">{it.unitsAvailable}</td>
                                            <td className="p-2 border">₹{it.avgCostPerUnit.toFixed(2)}</td>
                                            <td className="p-2 border">
                                                ₹{(it.unitsAvailable * it.avgCostPerUnit).toFixed(2)}
                                            </td>
                                            <td className="p-2 border">
                                                <button
                                                    onClick={() =>
                                                        deleteInventoryItem(it.itemName)
                                                    }
                                                    className="text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ---------------- PURCHASE LIST ---------------- */}
            <div className="p-4 bg-white rounded border">
                <h2 className="font-semibold mb-3">Purchases</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Item</th>
                                <th className="p-2 border">Qty</th>
                                <th className="p-2 border">Units Made</th>
                                <th className="p-2 border">Total Cost</th>
                                <th className="p-2 border">Cost/Unit</th>
                                <th className="p-2 border">Notes</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {purchases.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center p-4 text-gray-500">
                                        No purchases yet
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((p) => (
                                    <tr key={p._id}>
                                        <td className="p-2 border">{new Date(p.createdAt).toLocaleString()}</td>
                                        <td className="p-2 border">{p.itemName}</td>
                                        <td className="p-2 border">
                                            {p.qty} {p.unitType === "KG" ? "kg" : "units"}
                                        </td>
                                        <td className="p-2 border">{p.totalUnitsProduced}</td>
                                        <td className="p-2 border">₹{(p.purchaseCost + p.packagingCost).toFixed(2)}</td>
                                        <td className="p-2 border">₹{p.costPerUnit.toFixed(2)}</td>
                                        <td className="p-2 border">{p.notes || "-"}</td>
                                        <td className="p-2 border">
                                            <button
                                                className="text-red-600"
                                                onClick={() => deletePurchase(p._id!)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
