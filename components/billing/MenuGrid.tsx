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
            {menu.map((item: InventoryItem) => (
                <button
                    key={item._id ?? item.itemName}
                    onClick={() => addToCart(item)}
                    className="h-16 sm:h-20 text-xs sm:text-sm border rounded-md bg-slate-50 hover:bg-teal-50 flex items-center justify-center text-center px-2"
                >
                    {item.itemName}
                </button>
            ))}
        </div>
    );
}
