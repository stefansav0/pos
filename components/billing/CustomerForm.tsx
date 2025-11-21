import { User, Search } from "lucide-react";

interface CustomerFormProps {
    customerName: string;
    setCustomerName: (value: string) => void;

    customerPhone: string;
    setCustomerPhone: (value: string) => void;

    waiterName: string;
    setWaiterName: (value: string) => void;
}

export default function CustomerForm({
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    waiterName,
    setWaiterName,
}: CustomerFormProps) {
    return (
        <div className="border-t px-3 py-2 text-xs space-y-2">
            <div className="flex gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-0.5">
                        <User className="w-3 h-3" /> Customer
                    </div>
                    <input
                        className="w-full border rounded px-2 py-1 text-[11px]"
                        placeholder="Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-0.5">
                        <Search className="w-3 h-3" /> Phone
                    </div>
                    <input
                        className="w-full border rounded px-2 py-1 text-[11px]"
                        placeholder="Mobile"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <div className="text-[11px] text-gray-600 mb-0.5">Waiter / Delivery Boy</div>
                <input
                    className="w-full border rounded px-2 py-1 text-[11px]"
                    placeholder="Enter name"
                    value={waiterName}
                    onChange={(e) => setWaiterName(e.target.value)}
                />
            </div>
        </div>
    );
}
