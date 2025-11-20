"use client";

export default function InventorySummary({ inventory, totalValue }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white border rounded">
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-xl font-bold">{inventory.length}</div>
            </div>

            <div className="p-4 bg-white border rounded">
                <div className="text-sm text-gray-600">Total Units</div>
                <div className="text-xl font-bold">
                    {inventory.reduce((s: any, it: any) => s + it.unitsAvailable, 0)}
                </div>
            </div>

            <div className="p-4 bg-white border rounded">
                <div className="text-sm text-gray-600">Total Inventory Value</div>
                <div className="text-xl font-bold">₹{totalValue.toFixed(2)}</div>
            </div>
        </div>
    );
}
