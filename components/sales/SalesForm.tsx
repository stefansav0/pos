"use client";

export default function SalesForm({
    inventory,
    selectedItemName,
    setSelectedItemName,
    qtySold,
    setQtySold,
    sellingPrice,
    setSellingPrice,
    preview,
    onAddSale,
}: any) {
    return (
        <div className="p-4 bg-white border rounded">
            <h2 className="font-semibold mb-3">Record a Sale</h2>

            {/* Select Item */}
            <label>Item</label>
            <select
                className="w-full p-2 border rounded mb-3"
                value={selectedItemName}
                onChange={(e) => setSelectedItemName(e.target.value)}
            >
                <option value="">Select an item</option>
                {inventory.map((it: any) => (
                    <option key={it._id} value={it.itemName}>
                        {it.itemName} — {it.unitsAvailable} units
                    </option>
                ))}
            </select>

            {/* Quantity */}
            <label>Quantity</label>
            <input
                type="number"
                className="w-full p-2 border rounded mb-3"
                value={qtySold}
                onChange={(e) => setQtySold(+e.target.value)}
                min={1}
            />

            {/* Selling Price (Numbers Only) */}
            <label>Selling Price</label>
            <input
                type="text"
                className="w-full p-2 border rounded mb-3"
                value={sellingPrice}
                onChange={(e) => {
                    const value = e.target.value;

                    // Allow only digits
                    if (/^\d*$/.test(value)) {
                        setSellingPrice(value === "" ? "" : Number(value));
                    }
                }}
                placeholder="Enter amount (numbers only)"
            />

            {/* Preview Section */}
            <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                <strong>Preview</strong>
                {!preview ? (
                    <div className="text-gray-500">Enter quantity & price</div>
                ) : (
                    <>
                        <div>Unit Cost: ₹{preview.unitCost.toFixed(2)}</div>
                        <div>Revenue: ₹{preview.revenue.toFixed(2)}</div>
                        <div>COGS: ₹{preview.cogs.toFixed(2)}</div>
                        <div>Profit: ₹{preview.profit.toFixed(2)}</div>
                    </>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={onAddSale}
                className="px-4 py-2 bg-green-600 text-white w-full rounded"
            >
                Record Sale
            </button>
        </div>
    );
}
