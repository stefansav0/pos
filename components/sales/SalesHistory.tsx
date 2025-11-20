"use client";

export default function SalesHistory({ sales, deleteSale }: any) {
    return (
        <div className="mt-6 p-4 bg-white border rounded">
            <h2 className="font-semibold mb-3">Sales History</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Item</th>
                            <th className="p-2 border">Qty</th>
                            <th className="p-2 border">Revenue</th>
                            <th className="p-2 border">COGS</th>
                            <th className="p-2 border">Profit</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sales.map((s: any) => (
                            <tr key={s._id}>
                                <td className="p-2 border">
                                    {new Date(s.createdAt).toLocaleString()}
                                </td>
                                <td className="p-2 border">{s.itemName}</td>
                                <td className="p-2 border">{s.qtySold}</td>
                                <td className="p-2 border">₹{s.revenueTotal.toFixed(2)}</td>
                                <td className="p-2 border">₹{s.cogsTotal.toFixed(2)}</td>
                                <td className="p-2 border">₹{s.profitTotal.toFixed(2)}</td>

                                <td className="p-2 border">
                                    <button
                                        className="text-red-600"
                                        onClick={() => deleteSale(s._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-3 text-center text-gray-500">
                                    No sales recorded yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
