"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

/* ------------------ TYPES ------------------ */
type ExpenseCategory =
    | "Rent"
    | "Electricity"
    | "Staff Salary"
    | "Marketing"
    | "uber"
    | "Permissions / Licenses"
    | "Traval Cost"
    | "Other";

type Expense = {
    _id?: string;
    category: ExpenseCategory | string;
    amount: number;
    date: string;
    notes?: string | null;
    createdAt: string;
};

/* ------------------ DEFAULT CATEGORIES ------------------ */
const defaultCategories: ExpenseCategory[] = [
    "Rent",
    "Electricity",
    "Staff Salary",
    "Marketing",
    "uber",
    "Permissions / Licenses",
    "Traval Cost",
    "Other",
];

/* ------------------ MAIN COMPONENT ------------------ */
export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    /* form state */
    const [category, setCategory] = useState<ExpenseCategory | string>("Rent");
    const [amount, setAmount] = useState<number | "">("");
    const [date, setDate] = useState<string>(
        new Date().toISOString().slice(0, 10)
    );
    const [notes, setNotes] = useState<string>("");

    /* ------------------ LOAD FROM MONGO ------------------ */
    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        const data = await apiGet("/api/expenses");
        setExpenses(data);
    };

    /* ------------------ ADD EXPENSE ------------------ */
    const addExpense = async () => {
        if (!amount || Number(amount) <= 0) {
            alert("Enter valid amount");
            return;
        }

        const payload = {
            category,
            amount: Number(amount),
            date: new Date(date).toISOString(),
            notes: notes || null,
            createdAt: new Date().toISOString(),
        };

        await apiPost("/api/expenses", payload);
        alert("Expense saved!");

        // reload fresh
        await loadExpenses();

        // reset form
        setCategory("Rent");
        setAmount("");
        setNotes("");
        setDate(new Date().toISOString().slice(0, 10));
    };

    /* ------------------ DELETE EXPENSE ------------------ */
    const deleteExpense = async (id: string | undefined) => {
        if (!id) return;
        if (!confirm("Delete expense?")) return;

        await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
        await loadExpenses();
    };

    /* ------------------ SUMMARY CALCULATIONS ------------------ */
    const totals = useMemo(() => {
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);

        const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});

        return { total, byCategory };
    }, [expenses]);

    /* ------------------ EXPORT CSV ------------------ */
    const exportCSV = () => {
        let csv = "Date,Category,Amount,Notes\n";

        for (const e of expenses) {
            csv += `${new Date(e.date).toLocaleString()},${e.category},${e.amount},${e.notes || ""
                }\n`;
        }

        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "expenses.csv";
        a.click();
    };

    /* ------------------ UI ------------------ */
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">General Expenses (MongoDB)</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">

                {/* ------------------ ADD EXPENSE ------------------ */}
                <div className="p-4 bg-white border rounded">
                    <h2 className="font-semibold mb-3">Add Expense</h2>

                    <label className="block text-sm mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                    >
                        {defaultCategories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <label className="block text-sm mb-1">Amount</label>
                    <input
                        type="number"
                        value={amount as any}
                        onChange={(e) =>
                            setAmount(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className="w-full p-2 border rounded mb-3"
                    />

                    <label className="block text-sm mb-1">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                    />

                    <label className="block text-sm mb-1">Notes</label>
                    <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                    />

                    <button
                        onClick={addExpense}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                        Add Expense
                    </button>
                </div>

                {/* ------------------ SUMMARY ------------------ */}
                <div className="p-4 bg-white border rounded">
                    <h2 className="font-semibold mb-3">Summary</h2>

                    <div className="text-lg font-bold mb-2">
                        Total: ₹{totals.total.toFixed(2)}
                    </div>

                    <div className="text-sm text-gray-600 mb-3">By Category:</div>

                    <div className="space-y-2">
                        {Object.entries(totals.byCategory).length === 0 ? (
                            <div className="text-sm text-gray-500">No expenses yet</div>
                        ) : (
                            Object.entries(totals.byCategory).map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <div>{k}</div>
                                    <div>₹{v.toFixed(2)}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={exportCSV}
                        className="mt-4 px-3 py-2 bg-blue-600 text-white rounded"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ------------------ EXPENSE HISTORY ------------------ */}
            <div className="p-4 bg-white border rounded">
                <h2 className="font-semibold mb-3">Expense History</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Category</th>
                                <th className="p-2 border">Amount</th>
                                <th className="p-2 border">Notes</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td className="p-3 text-center text-gray-500" colSpan={5}>
                                        No expenses yet
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((ex) => (
                                    <tr key={ex._id}>
                                        <td className="p-2 border">
                                            {new Date(ex.date).toLocaleString()}
                                        </td>
                                        <td className="p-2 border">{ex.category}</td>
                                        <td className="p-2 border">₹{ex.amount.toFixed(2)}</td>
                                        <td className="p-2 border">{ex.notes || "-"}</td>
                                        <td className="p-2 border">
                                            <button
                                                onClick={() => deleteExpense(ex._id)}
                                                className="text-red-600 text-sm"
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
