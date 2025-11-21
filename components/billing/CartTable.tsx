import { Minus, Plus, Trash2 } from "lucide-react";

/* --- Types reused from your main page --- */
type CartItem = {
    id: string;
    itemName: string;
    qty: number;
    price: number;
};

interface CartTableProps {
    cart: CartItem[];
    changeQty: (id: string, delta: number) => void;
    changePrice: (id: string, price: number) => void;
    removeItem: (id: string) => void;
}

export default function CartTable({
    cart,
    changeQty,
    changePrice,
    removeItem,
}: CartTableProps) {
    if (cart.length === 0)
        return (
            <div className="text-center text-gray-500 text-sm mt-4">
                No items in bill.
            </div>
        );

    return (
        <table className="w-full text-xs border-collapse">
            <thead>
                <tr className="bg-slate-100">
                    <th className="border px-1 py-1 text-left">Item</th>
                    <th className="border px-1 py-1 text-center">Qty</th>
                    <th className="border px-1 py-1 text-right">Rate</th>
                    <th className="border px-1 py-1 text-right">Amt</th>
                    <th className="border px-1 py-1"></th>
                </tr>
            </thead>

            <tbody>
                {cart.map((c: CartItem) => (
                    <tr key={c.id}>
                        <td className="border px-1 py-1">{c.itemName}</td>

                        <td className="border px-1 py-1">
                            <div className="flex items-center justify-center gap-1">
                                <button
                                    className="w-5 h-5 flex items-center justify-center border rounded"
                                    onClick={() => changeQty(c.id, -1)}
                                >
                                    <Minus className="w-3 h-3" />
                                </button>

                                <span className="w-6 text-center">{c.qty}</span>

                                <button
                                    className="w-5 h-5 flex items-center justify-center border rounded"
                                    onClick={() => changeQty(c.id, 1)}
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </td>

                        <td className="border px-1 py-1 text-right">
                            <input
                                type="number"
                                className="w-16 text-right border rounded px-1 py-0.5"
                                value={c.price}
                                onChange={(e) =>
                                    changePrice(c.id, Number(e.target.value) || 0)
                                }
                            />
                        </td>

                        <td className="border px-1 py-1 text-right">
                            ₹{(c.qty * c.price).toFixed(2)}
                        </td>

                        <td className="border px-1 py-1 text-center">
                            <button
                                className="text-red-500"
                                onClick={() => removeItem(c.id)}
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
