import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sale from "@/models/Sale";
import InventoryItem from "@/models/InventoryItem";

export const dynamic = "force-dynamic";

export async function GET() {
    await dbConnect();
    const sales = await Sale.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(sales);
}

/* ===============================
   POST — handles BOTH:
   1) Single sale
   2) POS Multi-item billing
================================ */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        /* -------------------------------
           CASE A: POS BILL with items[]
        -------------------------------- */
        if (body.items && Array.isArray(body.items)) {
            const billItems = body.items;

            // Loop through items → update inventory + store sale entry
            const saleRecords = [];

            for (const item of billItems) {
                const {
                    itemName,
                    qty,
                    price,    // selling price per unit
                } = item;

                // Get inventory record
                const inv = await InventoryItem.findOne({ itemName });
                if (!inv) {
                    throw new Error(`Item '${itemName}' not found in inventory.`);
                }

                if (qty > inv.unitsAvailable) {
                    throw new Error(
                        `Insufficient stock for ${itemName}. Available: ${inv.unitsAvailable}`
                    );
                }

                // COGS from DB
                const unitCost = inv.avgCostPerUnit || 0;
                const revenueTotal = qty * price;
                const cogsTotal = qty * unitCost;
                const profitTotal = revenueTotal - cogsTotal;

                // Store sale record
                const saleDoc = await Sale.create({
                    itemName,
                    qtySold: qty,
                    sellingPricePerUnit: price,
                    revenueTotal,
                    cogsTotal,
                    profitTotal,
                    unitCostBeforeExtras: unitCost,
                    deliveryCost: 0,
                    packagingCost: 0,
                    notes: body.notes || null,
                    createdAt: new Date(),
                });

                saleRecords.push(saleDoc);

                // Update inventory
                inv.unitsAvailable = inv.unitsAvailable - qty;
                await inv.save();
            }

            return NextResponse.json(
                { message: "POS Bill Saved", sales: saleRecords },
                { status: 201 }
            );
        }

        /* -------------------------------
           CASE B: Normal Single-item sale
        -------------------------------- */
        const created = await Sale.create(body);
        return NextResponse.json(created, { status: 201 });

    } catch (err: any) {
        console.error("🔥 Sales API Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

/* -------------------------------
   DELETE single sale
-------------------------------- */
export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const sale = await Sale.findById(id);
        if (!sale) {
            return NextResponse.json({ error: "Sale not found" }, { status: 404 });
        }

        // restore inventory
        const inv = await InventoryItem.findOne({ itemName: sale.itemName });
        if (inv) {
            inv.unitsAvailable += sale.qtySold;
            await inv.save();
        }

        await Sale.findByIdAndDelete(id);

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("DELETE error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
