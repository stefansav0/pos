import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InventoryItem from "@/models/InventoryItem";

export const dynamic = "force-dynamic";

/* ---------------------------------------------------
   GET — Get all inventory items
--------------------------------------------------- */
export async function GET() {
    await dbConnect();
    const items = await InventoryItem.find().sort({ itemName: 1 }).lean();
    return NextResponse.json(items);
}

/* ---------------------------------------------------
   POST — Create or Update inventory item
   (Used by Sales, Purchases, Adjustments)
--------------------------------------------------- */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.itemName) {
            return NextResponse.json(
                { error: "itemName is required" },
                { status: 400 }
            );
        }

        // UPSERT (create if not exists)
        const updated = await InventoryItem.findOneAndUpdate(
            { itemName: body.itemName },
            {
                $set: {
                    avgCostPerUnit: body.avgCostPerUnit,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
                // Only set unitsAvailable if provided
                ...(body.unitsAvailable !== undefined && {
                    unitsAvailable: body.unitsAvailable,
                }),
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(updated, { status: 201 });

    } catch (err: any) {
        console.error("🔥 Inventory POST Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* ---------------------------------------------------
   DELETE — Delete inventory item by name
   (your UI calls `/api/inventory?name=potato`)
--------------------------------------------------- */
export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();

        const name = req.nextUrl.searchParams.get("name");

        if (!name) {
            return NextResponse.json(
                { error: "Missing ?name=itemName" },
                { status: 400 }
            );
        }

        const deleted = await InventoryItem.findOneAndDelete({ itemName: name });

        if (!deleted) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("🔥 Inventory DELETE Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
