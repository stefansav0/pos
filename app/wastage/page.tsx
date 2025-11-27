"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

export default function WastagePage() {
    const [inventory, setInventory] = useState([]);
    const [wastage, setWastage] = useState([]);

    const [itemName, setItemName] = useState("");
    const [qty, setQty] = useState(1);
    const [reason, setReason] = useState("");

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const inv = await apiGet("/api/inventory");
        const w = await apiGet("/api/wastage");

        setInventory(inv);
        setWastage(w);

        if (inv.length > 0 && !itemName) setItemName(inv[0].itemName);
    };

    const addWastage = async () => {
        if (!itemName || qty <= 0 || !reason)
            return alert("Fill all fields");

        await apiPost("/api/wastage", {
            itemName,
            qty,
            reason
        });

        await load();

        setQty(1);
        setReason("");
    };

    const deleteW = async (id: string) => {
        if (!confirm("Delete wastage & restore inventory?")) return;
        await fetch(`/api/wastage?id=${id}`, { method: "DELETE" });
        load();
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Wastage / Damage</h1>

            {/* Form */}
            <div className="p-4 bg-white rounded border mb-6">
                <h2 className="font-semibold mb-3">Add Wastage</h2>

                <label>Item</label>
                <select
                    className="w-full p-2 border rounded mb-3"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                >
                    {inventory.map((it: any) => (
                        <option key={it._id} value={it.itemName}>
                            {it.itemName} — {it.unitsAvailable} units
                        </option>
                    ))}
                </select>

                <label>Qty wasted</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded mb-3"
                    value={qty}
                    onChange={(e) => setQty(+e.target.value)}
                />

                <label>Reason</label>
                <input
                    className="w-full p-2 border rounded mb-3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />

                <button
                    onClick={addWastage}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                >
                    Add Wastage
                </button>
            </div>

            {/* List */}
            <div className="p-4 bg-white rounded border">
                <h2 className="font-semibold mb-3">Wastage History</h2>

                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Item</th>
                            <th className="p-2 border">Qty</th>
                            <th className="p-2 border">Cost Loss</th>
                            <th className="p-2 border">Reason</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {wastage.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    No wastage recorded
                                </td>
                            </tr>
                        ) : (
                            wastage.map((w: any) => (
                                <tr key={w._id}>
                                    <td className="p-2 border">
                                        {new Date(w.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-2 border">{w.itemName}</td>
                                    <td className="p-2 border">{w.qty}</td>
                                    <td className="p-2 border">₹{w.costLoss.toFixed(2)}</td>
                                    <td className="p-2 border">{w.reason}</td>
                                    <td className="p-2 border">
                                        <button
                                            onClick={() => deleteW(w._id)}
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
    );
}
