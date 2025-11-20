"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

import SalesForm from "@/components/sales/SalesForm";
import SalesKPIs from "@/components/sales/SalesKPIs";
import SalesHistory from "@/components/sales/SalesHistory";
import InventorySnapshot from "@/components/sales/InventorySnapshot";

/* ------------------ TYPES ------------------ */
export interface InventoryItem {
    _id?: string;
    itemName: string;
    unitsAvailable: number;
    avgCostPerUnit: number;
    updatedAt: string;
}

export interface SaleRecord {
    _id?: string;
    itemName: string;
    qtySold: number;
    sellingPricePerUnit: number;
    deliveryCost: number;
    packagingCost: number;
    cogsTotal: number;
    revenueTotal: number;
    profitTotal: number;
    unitCostBeforeExtras: number;
    notes?: string;
    createdAt: string;
}

export default function SalesPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [sales, setSales] = useState<SaleRecord[]>([]);

    const [selectedItemName, setSelectedItemName] = useState<string>("");
    const [qtySold, setQtySold] = useState<number>(1);
    const [sellingPrice, setSellingPrice] = useState<number>(0);
    const [deliveryCost, setDeliveryCost] = useState<number>(0);
    const [packagingCost, setPackagingCost] = useState<number>(0);
    const [notes, setNotes] = useState<string>("");

    /* ------------------ LOAD DATA ------------------ */
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        const [inv, s] = await Promise.all([
            apiGet("/api/inventory"),
            apiGet("/api/sales"),
        ]);

        setInventory(inv);
        setSales(s);

        if (!selectedItemName && inv.length > 0) {
            setSelectedItemName(inv[0].itemName);
        }
    };

    const selectedInventoryItem: InventoryItem | undefined = inventory.find(
        (it) => it.itemName === selectedItemName
    );

    /* ------------------ PREVIEW CALC ------------------ */
    const preview = useMemo(() => {
        if (!selectedInventoryItem) return null;

        const unitCost = selectedInventoryItem.avgCostPerUnit;
        const revenue = qtySold * sellingPrice;
        const cogs = qtySold * unitCost + deliveryCost + packagingCost;
        const profit = revenue - cogs;

        return { unitCost, revenue, cogs, profit };
    }, [selectedInventoryItem, qtySold, sellingPrice, deliveryCost, packagingCost]);

    /* ------------------ SAVE SALE ------------------ */
    const onAddSale = async () => {
        if (!selectedInventoryItem)
            return alert("Select an item.");

        if (qtySold <= 0) return alert("Quantity must be positive.");
        if (qtySold > selectedInventoryItem.unitsAvailable)
            return alert(`Not enough stock. Available: ${selectedInventoryItem.unitsAvailable}`);

        const payload: SaleRecord = {
            itemName: selectedInventoryItem.itemName,
            qtySold,
            sellingPricePerUnit: sellingPrice,
            deliveryCost,
            packagingCost,
            revenueTotal: qtySold * sellingPrice,
            cogsTotal: qtySold * selectedInventoryItem.avgCostPerUnit + deliveryCost + packagingCost,
            profitTotal:
                qtySold * sellingPrice -
                (qtySold * selectedInventoryItem.avgCostPerUnit + deliveryCost + packagingCost),
            unitCostBeforeExtras: selectedInventoryItem.avgCostPerUnit,
            notes,
            createdAt: new Date().toISOString(),
        };

        await apiPost("/api/sales", payload);

        await apiPost("/api/inventory", {
            itemName: selectedInventoryItem.itemName,
            unitsAvailable: selectedInventoryItem.unitsAvailable - qtySold,
            avgCostPerUnit: selectedInventoryItem.avgCostPerUnit,
        });

        loadAll();

        setQtySold(1);
        setSellingPrice(0);
        setDeliveryCost(0);
        setPackagingCost(0);
        setNotes("");
    };

    /* ------------------ DELETE + RESTORE STOCK ------------------ */
    const deleteSale = async (id: string) => {
        const sale = sales.find((s) => s._id === id);
        if (!sale) return;

        if (!confirm("Delete this sale and restore stock?")) return;

        await fetch(`/api/sales?id=${id}`, { method: "DELETE" });

        const invItem = inventory.find((i) => i.itemName === sale.itemName);
        if (invItem) {
            await apiPost("/api/inventory", {
                itemName: invItem.itemName,
                unitsAvailable: invItem.unitsAvailable + sale.qtySold,
                avgCostPerUnit: invItem.avgCostPerUnit,
            });
        }

        loadAll();
    };

    /* ------------------ KPIs ------------------ */
    const totals = useMemo(
        () => ({
            revenue: sales.reduce((s, r) => s + r.revenueTotal, 0),
            cogs: sales.reduce((s, r) => s + r.cogsTotal, 0),
            profit: sales.reduce((s, r) => s + r.profitTotal, 0),
        }),
        [sales]
    );

    /* ------------------ UI ------------------ */
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Sales / Deliveries</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SalesForm
                    inventory={inventory}
                    selectedItemName={selectedItemName}
                    setSelectedItemName={setSelectedItemName}
                    qtySold={qtySold}
                    setQtySold={setQtySold}
                    sellingPrice={sellingPrice}
                    setSellingPrice={setSellingPrice}
                    deliveryCost={deliveryCost}
                    setDeliveryCost={setDeliveryCost}
                    packagingCost={packagingCost}
                    setPackagingCost={setPackagingCost}
                    notes={notes}
                    setNotes={setNotes}
                    preview={preview}
                    onAddSale={onAddSale}
                />

                <InventorySnapshot inventory={inventory} />
            </div>

            <SalesKPIs totals={totals} />

            <SalesHistory sales={sales} deleteSale={deleteSale} />
        </div>
    );
}
