"use client";

export default function MovementHistory({ movementHistory, deleteHistory }: any) {
    return (
        <div className="p-4 bg-white border rounded mb-6">
            <h2 className="font-semibold mb-3">Stock Movement History</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Type</th>
                            <th className="p-2 border">Item</th>
                            <th className="p-2 border">Qty</th>
                            <th className="p-2 border">Details</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {movementHistory.map((m: any) => (
                            <tr key={m._id}>
                                <td className="p-2 border">{new Date(m.date).toLocaleString()}</td>
                                <td className="p-2 border">{m.type}</td>
                                <td className="p-2 border">{m.itemName}</td>
                                <td className="p-2 border">{m.qty}</td>
                                <td className="p-2 border">{m.extra}</td>
                                <td className="p-2 border">
                                    <button
                                        className="text-red-600"
                                        onClick={() => deleteHistory(m)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {movementHistory.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-3 text-center text-gray-500">
                                    No history yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
