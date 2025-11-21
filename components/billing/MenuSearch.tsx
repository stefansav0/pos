import { Search } from "lucide-react";

interface MenuSearchProps {
    search: string;
    setSearch: (value: string) => void;
}

export default function MenuSearch({ search, setSearch }: MenuSearchProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-3">
            <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                    className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                    placeholder="Search item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex gap-1 overflow-x-auto text-xs">
                {["All", "Snacks", "Main Course", "Beverages", "Desserts"].map((c) => (
                    <button
                        key={c}
                        className="px-3 py-1 rounded-full border bg-slate-50 text-gray-700 whitespace-nowrap"
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>
    );
}
