"use client";

export default function SalesKPIs({ totals }: any) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-white border rounded">
                <div className="text-sm text-gray-500">Revenue</div>
                <div className="text-2xl font-bold">₹{totals.revenue.toFixed(2)}</div>
            </div>

            <div className="p-4 bg-white border rounded">
                <div className="text-sm text-gray-500">COGS</div>
                <div className="text-2xl font-bold">₹{totals.cogs.toFixed(2)}</div>
            </div>

            <div className="p-4 bg-white border rounded">
                <div className="text-sm text-gray-500">Profit</div>
                <div className="text-2xl font-bold">₹{totals.profit.toFixed(2)}</div>
            </div>
        </div>
    );
}
