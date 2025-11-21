import { User } from "lucide-react";

type ModeType = "TABLE" | "TAKEOUT" | "DELIVERY";

interface BillingHeaderProps {
    waiterName: string;
    selectedMode: ModeType;
}

export default function BillingHeader({ waiterName, selectedMode }: BillingHeaderProps) {
    return (
        <header className="w-full bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    <span className="font-semibold text-lg">POS Billing</span>
                </div>

                <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <User className="w-4 h-4" /> {waiterName || "Waiter not set"}
                    </span>

                    <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700">
                        {selectedMode === "TABLE"
                            ? "Table Service"
                            : selectedMode === "TAKEOUT"
                                ? "Take Out"
                                : "Delivery"}
                    </span>
                </div>
            </div>
        </header>
    );
}
