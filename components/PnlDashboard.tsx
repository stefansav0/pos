"use client";

import React, { useMemo, useState } from "react";

import { usePnlData } from "@/components/usePnlData";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const formatMoney = (n: number) => "₹" + n.toFixed(2);

export default function PnlDashboard() {
    const {
        purchases,
        sales,
        inventory,
        adjustments,
        expenses,
        events,
        daily,
        monthly,
        yearly,
        loading,
        refreshAll,
    } = usePnlData();

    const [tab, setTab] = useState<"daily" | "monthly" | "yearly" | "all">("daily");

    /* ------------------- Current Chart Series ------------------- */
    const currentSeries = useMemo(() => {
        if (tab === "daily") return daily;
        if (tab === "monthly") return monthly;
        if (tab === "yearly") return yearly;

        // ALL TIME
        const revenue = sales.reduce((s, r) => s + r.revenueTotal, 0);
        const cogs = sales.reduce((s, r) => s + r.cogsTotal, 0);
        const op = events
            .filter(e => ["PURCHASE_TRAVEL", "DAMAGE_LOSS", "GENERAL_EXPENSE"].includes(e.type))
            .reduce((s, e) => s + e.amount, 0);

        return [
            {
                date: "All Time",
                revenue,
                cogs,
                opExpenses: op,
                profit: revenue - cogs - op,
            },
        ];
    }, [tab, daily, monthly, yearly, sales, events]);

    /* ----------------------- KPI Summary ----------------------- */
    const KPIs = useMemo(() => {
        const revenue = currentSeries.reduce((s, r) => s + (r.revenue || 0), 0);
        const cogs = currentSeries.reduce((s, r) => s + (r.cogs || 0), 0);
        const opExpenses = currentSeries.reduce((s, r) => s + (r.opExpenses || 0), 0);
        const profit = revenue - cogs - opExpenses;

        const inventoryValue = inventory.reduce(
            (s, i) => s + i.unitsAvailable * i.avgCostPerUnit,
            0
        );

        return { revenue, cogs, opExpenses, profit, inventoryValue };
    }, [currentSeries, inventory]);

    const chartData = currentSeries.map((r) => ({
        name: r.date,
        revenue: r.revenue,
        cogs: r.cogs,
        profit: r.profit,
    }));

    /* ---------------------- Expense Pie ------------------------ */
    const expenseBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};

        events.forEach(e => {
            if (["PURCHASE_TRAVEL", "DAMAGE_LOSS", "GENERAL_EXPENSE"].includes(e.type)) {
                breakdown[e.type] = (breakdown[e.type] || 0) + e.amount;
            }
        });

        return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    }, [events]);

    const colors = ["#F97316", "#EF4444", "#06B6D4", "#10B981"];

    /* ---------------- LOADING SCREEN ---------------- */
    if (loading) {
        return (
            <div>

                <div className="max-w-7xl mx-auto p-6 text-lg">
                    Loading P&L...
                </div>
            </div>
        );
    }

    /* ------------------ MAIN RENDER ------------------ */
    return (
        <div>


            <div className="max-w-7xl mx-auto p-6">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">P&L Dashboard (MongoDB)</h1>

                    <div className="flex gap-2">
                        <button onClick={refreshAll} className="px-3 py-1 border rounded">
                            Refresh
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-6">
                    {["daily", "monthly", "yearly", "all"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`px-4 py-2 rounded ${tab === t ? "bg-gray-900 text-white" : "bg-white border"
                                }`}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 bg-white rounded shadow">
                        <div className="text-sm text-gray-500">Revenue</div>
                        <div className="text-2xl font-bold">{formatMoney(KPIs.revenue)}</div>
                    </div>

                    <div className="p-4 bg-white rounded shadow">
                        <div className="text-sm text-gray-500">COGS</div>
                        <div className="text-2xl font-bold">{formatMoney(KPIs.cogs)}</div>
                    </div>

                    <div className="p-4 bg-white rounded shadow">
                        <div className="text-sm text-gray-500">Op. Expenses</div>
                        <div className="text-2xl font-bold">{formatMoney(KPIs.opExpenses)}</div>
                    </div>

                    <div className="p-4 bg-white rounded shadow">
                        <div className="text-sm text-gray-500">Net Profit</div>
                        <div className="text-2xl font-bold">{formatMoney(KPIs.profit)}</div>
                    </div>

                    <div className="p-4 bg-white rounded shadow">
                        <div className="text-sm text-gray-500">Inventory Value</div>
                        <div className="text-2xl font-bold">
                            {formatMoney(KPIs.inventoryValue)}
                        </div>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    <div className="lg:col-span-2 p-4 bg-white rounded shadow">
                        <h3 className="font-semibold mb-3">Revenue / COGS / Profit</h3>

                        <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={2} />
                                    <Line type="monotone" dataKey="cogs" stroke="#EF4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded shadow">
                        <h3 className="font-semibold mb-3">Expense Breakdown</h3>

                        {expenseBreakdown.length === 0 ? (
                            <div className="text-sm text-gray-500">No expenses</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdown}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {expenseBreakdown.map((_, i) => (
                                            <Cell key={i} fill={colors[i % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* TABLE */}
                <div className="p-4 bg-white rounded shadow mb-6">
                    <h3 className="font-semibold mb-3">
                        {tab === "all" ? "All Time Summary" : `P&L (${tab})`}
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Period</th>
                                    <th className="p-2 border">Revenue</th>
                                    <th className="p-2 border">COGS</th>
                                    <th className="p-2 border">Op. Expenses</th>
                                    <th className="p-2 border">Profit</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentSeries.map((r) => (
                                    <tr key={r.date}>
                                        <td className="p-2 border">{r.date}</td>
                                        <td className="p-2 border">{formatMoney(r.revenue)}</td>
                                        <td className="p-2 border">{formatMoney(r.cogs)}</td>
                                        <td className="p-2 border">{formatMoney(r.opExpenses)}</td>
                                        <td className="p-2 border">{formatMoney(r.profit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
