type ModeType = "TABLE" | "TAKEOUT" | "DELIVERY";

interface BillingModesProps {
    selectedMode: ModeType;
    setSelectedMode: (mode: ModeType) => void;
}

export default function BillingModes({ selectedMode, setSelectedMode }: BillingModesProps) {
    const modes: { key: ModeType; label: string }[] = [
        { key: "TABLE", label: "Table" },
        { key: "TAKEOUT", label: "Take Out" },
        { key: "DELIVERY", label: "Delivery" },
    ];

    return (
        <div className="bg-slate-800">
            <div className="max-w-7xl mx-auto flex">
                {modes.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setSelectedMode(m.key)}
                        className={`flex-1 py-2 text-sm font-medium border-r border-slate-700 ${selectedMode === m.key
                                ? "bg-teal-500 text-white"
                                : "text-gray-100 hover:bg-slate-700"
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
