"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import AdjustmentForm from "@/components/inventory/AdjustmentForm";

/* ---- Add the missing type ---- */
type InventoryItem = {
    _id: string;
    itemName: string;
    unitsAvailable: number;
    avgCostPerUnit: number;
    updatedAt: string;
};

export default function AdjustmentPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [adjQty, setAdjQty] = useState(1);
    const [reason, setReason] = useState("");

    useEffect(() => {
        apiGet("/api/inventory").then((data) => setInventory(data));
    }, []);

    const addAdjustment = async () => {
        const item = inventory.find((i) => i.itemName === selectedItem);
        if (!item) return alert("Item not found");

        await apiPost("/api/adjustments", {
            itemName: selectedItem,
            qty: adjQty,
            reason,
            createdAt: new Date().toISOString(),
        });

        await apiPost("/api/inventory", {
            itemName: selectedItem,
            unitsAvailable: Math.max(0, item.unitsAvailable + adjQty),
            avgCostPerUnit: item.avgCostPerUnit,
        });

        alert("Adjustment added");
        setAdjQty(1);
        setReason("");
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Add Adjustment</h1>

            <AdjustmentForm
                inventory={inventory}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                adjQty={adjQty}
                setAdjQty={setAdjQty}
                reason={reason}
                setReason={setReason}
                addAdjustment={addAdjustment}
            />
        </div>
    );
}
