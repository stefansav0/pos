"use client";

export default function InventoryTable({ inventory, exportCSV }: any) {
    return (
        <div className="p-4 bg-white border rounded mb-6">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Current Inventory</h2>

                <button
                    onClick={exportCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Export CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Item</th>
                            <th className="p-2 border">Units</th>
                            <th className="p-2 border">Avg Cost</th>
                            <th className="p-2 border">Value</th>
                        </tr>
                    </thead>

                    <tbody>
                        {inventory.length === 0 ? (
                            <tr>
                                <td className="p-3 text-center text-gray-500" colSpan={4}>
                                    No items in inventory
                                </td>
                            </tr>
                        ) : (
                            inventory.map((it: any) => (
                                <tr key={it._id}>
                                    <td className="p-2 border">{it.itemName}</td>
                                    <td className="p-2 border">{it.unitsAvailable}</td>
                                    <td className="p-2 border">₹{it.avgCostPerUnit.toFixed(2)}</td>
                                    <td className="p-2 border">
                                        ₹{(it.unitsAvailable * it.avgCostPerUnit).toFixed(2)}
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
