import CartTable from "./CartTable";
import BillTotals from "./BillTotals";
import CustomerForm from "./CustomerForm";
import BillingButton from "./BillingButton";
import { SmartphoneCharging } from "lucide-react";

/* --- Types reused from main page --- */
type CartItem = {
    id: string;
    itemName: string;
    qty: number;
    price: number;
};

interface BillPanelProps {
    cart: CartItem[];
    changeQty: (id: string, delta: number) => void;
    changePrice: (id: string, price: number) => void;
    removeItem: (id: string) => void;

    subtotal: number;
    discount: number;
    setDiscount: (value: number) => void;
    grandTotal: number;
    totalQty: number;

    customerName: string;
    setCustomerName: (value: string) => void;
    customerPhone: string;
    setCustomerPhone: (value: string) => void;
    waiterName: string;
    setWaiterName: (value: string) => void;

    handleBilling: () => void;
    clearCart: () => void;
}

export default function BillPanel({
    cart,
    changeQty,
    changePrice,
    removeItem,
    subtotal,
    discount,
    setDiscount,
    grandTotal,
    totalQty,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    waiterName,
    setWaiterName,
    handleBilling,
    clearCart,
}: BillPanelProps) {
    return (
        <section className="w-full lg:w-80 xl:w-96 bg-white rounded-lg shadow-sm border flex flex-col">
            {/* Header */}
            <div className="border-b px-3 py-2 flex items-center justify-between">
                <div>
                    <div className="text-xs text-gray-500">Bill Detail</div>
                    <div className="text-sm font-semibold">
                        Items: {totalQty} • Total: ₹{grandTotal.toFixed(2)}
                    </div>
                </div>
                <button className="text-xs text-red-500" onClick={clearCart}>
                    Clear
                </button>
            </div>

            {/* Cart Table */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
                <CartTable
                    cart={cart}
                    changeQty={changeQty}
                    changePrice={changePrice}
                    removeItem={removeItem}
                />
            </div>

            {/* Totals */}
            <BillTotals
                subtotal={subtotal}
                discount={discount}
                setDiscount={setDiscount}
                grandTotal={grandTotal}
            />

            {/* Customer */}
            <CustomerForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                waiterName={waiterName}
                setWaiterName={setWaiterName}
            />

            {/* UPI Section */}
            <div className="px-3 py-2 border-t">
                <div className="flex items-center gap-2 border p-2 rounded-md">
                    <SmartphoneCharging className="w-5 h-5 text-teal-600" />
                    <div className="text-[11px]">
                        <div className="font-semibold">UPI Payment</div>
                        <div className="text-gray-600">
                            Ask customer to scan QR & pay ₹{grandTotal.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Button */}
            <BillingButton grandTotal={grandTotal} handleBilling={handleBilling} />
        </section>
    );
}
