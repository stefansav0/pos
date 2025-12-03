import CartTable from "./CartTable";
import BillTotals from "./BillTotals";
import CustomerForm from "./CustomerForm";
import BillingButton from "./BillingButton";
import { SmartphoneCharging, CheckCircle, Download } from "lucide-react";
import { useMemo, useState } from "react";

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

    /* ======================================================
                1) AUTO GENERATE UPI QR URL
    ====================================================== */
    const upiId = "6296018033.wallet@phonepe"; // CHANGE THIS TO YOUR UPI ID

    const upiURL = useMemo(() => {
        return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
            customerName || "Customer"
        )}&am=${grandTotal}&tn=${encodeURIComponent("Bill Payment")}`;
    }, [customerName, grandTotal]);

    const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        upiURL
    )}`;

    /* ======================================================
                2) PAYMENT RECEIVED BUTTON
    ====================================================== */
    const [paymentReceived, setPaymentReceived] = useState(false);

    const markPaymentReceived = () => {
        setPaymentReceived(true);
        handleBilling(); // auto generate bill
    };

    /* ======================================================
                3) DOWNLOAD QR IMAGE
    ====================================================== */
    const downloadQR = () => {
        const link = document.createElement("a");
        link.href = qrImg;
        link.download = `UPI_QR_${grandTotal}.png`;
        link.click();
    };

    /* ======================================================
                          UI
    ====================================================== */
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

            {/* Customer Form */}
            <CustomerForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                waiterName={waiterName}
                setWaiterName={setWaiterName}
            />

            {/* -------------------------------------------------------
                           UPI PAYMENT + QR
            ------------------------------------------------------- */}
            <div className="px-3 py-3 border-t">
                <div className="text-sm font-semibold mb-2">UPI Payment</div>

                {/* QR Box */}
                <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center border">
                    <img src={qrImg} alt="UPI QR" className="w-40 h-40" />

                    <div className="mt-2 text-xs text-gray-600">
                        Scan to pay ₹{grandTotal.toFixed(2)}
                    </div>

                    {/* Download QR */}
                    <button
                        onClick={downloadQR}
                        className="mt-3 px-3 py-1.5 text-xs bg-gray-800 text-white rounded flex items-center gap-1"
                    >
                        <Download size={14} /> Download QR
                    </button>
                </div>
            </div>

            {/* -------------------------------------------------------
                         CONFIRM PAYMENT RECEIVED
            ------------------------------------------------------- */}
            <div className="px-3 py-2 border-t">
                <button
                    onClick={markPaymentReceived}
                    className={`w-full py-2 rounded text-white font-semibold flex items-center justify-center gap-2
                        ${paymentReceived ? "bg-green-600" : "bg-blue-600"}
                    `}
                >
                    {paymentReceived ? (
                        <>
                            <CheckCircle size={18} /> Payment Received
                        </>
                    ) : (
                        <>
                            <SmartphoneCharging size={18} /> Mark as Paid
                        </>
                    )}
                </button>
            </div>

            {/* Billing Button (Generate PDF / Bill) */}
            <BillingButton grandTotal={grandTotal} handleBilling={handleBilling} />
        </section>
    );
}
