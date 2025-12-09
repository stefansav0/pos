

export async function updateInventoryOnSale(items) {
    for (const it of items) {
        const inv = await Inventory.findOne({ itemName: it.itemName });

        if (!inv) continue;

        let remaining = inv.unitsAvailable - it.quantity;
        if (remaining < 0) remaining = 0;

        inv.unitsAvailable = remaining;
        await inv.save();
    }
}
