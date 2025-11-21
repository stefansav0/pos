interface BillingButtonProps {
    grandTotal: number;
    handleBilling: () => void;
}

export default function BillingButton({
    grandTotal,
    handleBilling,
}: BillingButtonProps) {
    return (
        <div className="border-t px-3 py-3 bg-slate-50">
            <button
                onClick={handleBilling}
                className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
                <span className="text-lg">₹</span>
                <span>Billing • ₹{grandTotal.toFixed(2)}</span>
            </button>
        </div>
    );
}
