"use client";

export default function AdjustmentForm({
    inventory,
    selectedItem,
    setSelectedItem,
    adjQty,
    setAdjQty,
    reason,
    setReason,
    addAdjustment,
}: any) {
    return (
        <div className="p-4 bg-white border rounded mb-6">
            <h2 className="font-semibold mb-3">Manual Stock Adjustment</h2>

            <label>Item</label>
            <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="p-2 border rounded w-full mb-3"
            >
                <option value="">Select item</option>
                {inventory.map((it: any) => (
                    <option key={it._id} value={it.itemName}>
                        {it.itemName} — {it.unitsAvailable} units
                    </option>
                ))}
            </select>

            <label>Quantity (+ add, - remove)</label>
            <input
                type="number"
                className="p-2 border rounded w-full mb-3"
                value={adjQty}
                onChange={(e) => setAdjQty(Number(e.target.value))}
            />

            <label>Reason</label>
            <input
                className="p-2 border rounded w-full mb-3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />

            <button
                onClick={addAdjustment}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                Add Adjustment
            </button>
        </div>
    );
}
