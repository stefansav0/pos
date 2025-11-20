"use client";

import React, { useEffect, useState, useMemo } from "react";

type MenuItem = {
    _id: string;
    name: string;
    price: number;
};

type BillRow = {
    id: string;
    itemName: string;
    qty: number;
    price: number;
    total: number;
};

export default function BillingPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [billRows, setBillRows] = useState<BillRow[]>([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [note, setNote] = useState("");

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        const res = await fetch("/api/purchase");
        const data = await res.json();
        setItems(data);
    };

    const addToBill = () => {
        if (!selectedItem) return alert("Select item");
        if (qty <= 0) return alert("Quantity must be 1+");

        const item = items.find((i) => i._id === selectedItem);
        const p = price > 0 ? price : item?.price || 0;

        const row: BillRow = {
            id: Date.now().toString(),
            itemName: item?.name || "",
            qty,
            price: p,
            total: p * qty,
        };

        setBillRows([...billRows, row]);
        setQty(1);
        setPrice(0);
        setSelectedItem("");
    };

    const removeRow = (id: string) => {
        setBillRows(billRows.filter((r) => r.id !== id));
    };

    const totals = useMemo(() => {
        const subtotal = billRows.reduce((s, r) => s + r.total, 0);
        const finalTotal = subtotal; // no GST
        return { subtotal, finalTotal };
    }, [billRows]);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Billing</h1>

            {/* ---------------- Add Item ---------------- */}
            <div className="p-4 bg-white border rounded mb-6">
                <h2 className="font-semibold mb-3">Add Item</h2>

                <label>Item</label>
                <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full p-2 border rounded mb-3"
                >
                    <option value="">Select item</option>
                    {items.map((it) => (
                        <option key={it._id} value={it._id}>
                            {it.name} — ₹{it.price}
                        </option>
                    ))}
                </select>

                <label>Qty</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded mb-3"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                />

                <label>Price (optional override)</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded mb-3"
                    placeholder="Leave blank to use default"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />

                <button
                    onClick={addToBill}
                    className="w-full bg-green-600 text-white py-2 rounded"
                >
                    Add to Bill
                </button>
            </div>

            {/* ---------------- Bill Table ---------------- */}
            <div className="p-4 bg-white border rounded mb-6">
                <h2 className="font-semibold mb-3">Bill Items</h2>

                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Item</th>
                            <th className="p-2 border">Qty</th>
                            <th className="p-2 border">Price</th>
                            <th className="p-2 border">Total</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {billRows.map((r) => (
                            <tr key={r.id}>
                                <td className="p-2 border">{r.itemName}</td>
                                <td className="p-2 border">{r.qty}</td>
                                <td className="p-2 border">₹{r.price}</td>
                                <td className="p-2 border">₹{r.total}</td>
                                <td className="p-2 border">
                                    <button
                                        onClick={() => removeRow(r.id)}
                                        className="text-red-600"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {billRows.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-3 text-center text-gray-500">
                                    No items added yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---------------- Bill Summary ---------------- */}
            <div className="p-4 bg-white border rounded mb-6">
                <h2 className="font-semibold mb-3">Summary</h2>

                <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <strong>₹{totals.subtotal.toFixed(2)}</strong>
                </div>

                <div className="flex justify-between mb-2 text-lg">
                    <span>Total</span>
                    <strong>₹{totals.finalTotal.toFixed(2)}</strong>
                </div>

                <label className="block mt-4">Payment Method</label>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                </select>

                {paymentMethod === "upi" && (
                    <div className="mt-4 p-4 border rounded bg-gray-50 text-center">
                        <h3 className="font-semibold mb-2">Scan to Pay</h3>

                        <img
                            src="/upi-qr.png"
                            alt="QR"
                            className="mx-auto w-40 h-40 mb-2"
                        />

                        <div className="text-sm text-gray-600">
                            Amount: <strong>₹{totals.finalTotal.toFixed(2)}</strong>
                        </div>
                    </div>
                )}

                <label className="block mt-4">Note (optional)</label>
                <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Thanks for your purchase"
                />
            </div>
        </div>
    );
}
