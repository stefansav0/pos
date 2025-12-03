type InventoryItem = {
    _id?: string;
    itemName: string;
    avgCostPerUnit?: number;
    unitsAvailable?: number;
    sellingPrice?: number;
};

interface MenuGridProps {
    menu: InventoryItem[];
    addToCart: (item: InventoryItem) => void;
}

export default function MenuGrid({ menu, addToCart }: MenuGridProps) {
    if (menu.length === 0)
        return (
            <div className="text-center text-gray-500 text-sm mt-6">
                No items found. Add items in Inventory.
            </div>
        );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto">
            {menu.map((item: InventoryItem) => {
                const outOfStock = !item.unitsAvailable || item.unitsAvailable <= 0;

                return (
                    <button
                        key={item._id ?? item.itemName}
                        onClick={() => !outOfStock && addToCart(item)}
                        disabled={outOfStock}
                        className={`h-18 sm:h-24 text-xs sm:text-sm border rounded-md 
                            flex flex-col items-center justify-center px-2 text-center
                            transition-all 
                            ${outOfStock
                                ? "bg-gray-200 cursor-not-allowed opacity-50"
                                : "bg-slate-50 hover:bg-teal-50 cursor-pointer"
                            }`}
                    >
                        {/* ITEM NAME */}
                        <div className="font-medium">{item.itemName}</div>

                        {/* AVAILABLE STOCK */}
                        <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                            Available: <span className="font-semibold">
                                {item.unitsAvailable ?? 0}
                            </span>
                        </div>

                        {/* PRICE */}
                        <div className="text-green-600 font-bold mt-1 text-[11px] sm:text-sm">
                            ₹{item.sellingPrice ?? 200}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
