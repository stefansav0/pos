interface BillTotalsProps {
    subtotal: number;
    discount: number;
    setDiscount: (value: number) => void;
    grandTotal: number;
}

export default function BillTotals({
    subtotal,
    discount,
    setDiscount,
    grandTotal,
}: BillTotalsProps) {
    return (
        <div className="border-t px-3 py-2 text-xs space-y-1">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center gap-2">
                <span>Discount</span>
                <input
                    type="number"
                    className="w-20 border rounded px-1 py-0.5 text-right"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                />
            </div>

            <div className="flex justify-between font-semibold text-sm pt-1 border-t mt-1">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
            </div>
        </div>
    );
}
