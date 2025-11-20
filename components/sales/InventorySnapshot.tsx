"use client";

export default function InventorySnapshot({ inventory }: any) {
    return (
        <div className="p-4 bg-white border rounded lg:col-span-2">
            <h2 className="font-semibold mb-3">Inventory Snapshot</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Item</th>
                            <th className="p-2 border">Units</th>
                            <th className="p-2 border">Cost/Unit</th>
                            <th className="p-2 border">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((it: any) => (
                            <tr key={it._id}>
                                <td className="p-2 border">{it.itemName}</td>
                                <td className="p-2 border">{it.unitsAvailable}</td>
                                <td className="p-2 border">
                                    ₹{it.avgCostPerUnit.toFixed(2)}
                                </td>
                                <td className="p-2 border">
                                    ₹{(it.unitsAvailable * it.avgCostPerUnit).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
