import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Adjustment from "@/models/Adjustment";
import InventoryItem from "@/models/InventoryItem";

export const dynamic = "force-dynamic";

/* ---------------------------------------------------
   GET — Fetch all adjustments
--------------------------------------------------- */
export async function GET() {
    await dbConnect();
    const rows = await Adjustment.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(rows);
}

/* ---------------------------------------------------
   POST — Create new adjustment + update inventory
--------------------------------------------------- */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.itemName || body.qty === undefined) {
            return NextResponse.json(
                { error: "itemName and qty are required" },
                { status: 400 }
            );
        }

        // Convert createdAt to Date if needed
        if (body.createdAt && typeof body.createdAt === "string") {
            body.createdAt = new Date(body.createdAt);
        }

        // 1️⃣ Create adjustment
        const created = await Adjustment.create(body);

        // 2️⃣ Apply stock change to Inventory
        const inv = await InventoryItem.findOne({ itemName: body.itemName });

        if (inv) {
            inv.unitsAvailable = Math.max(0, inv.unitsAvailable + Number(body.qty));
            inv.updatedAt = new Date();
            await inv.save();
        }

        return NextResponse.json(created, { status: 201 });

    } catch (err: any) {
        console.error("🔥 Adjustment API Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* ---------------------------------------------------
   DELETE — Remove an adjustment (optional: rollback stock)
--------------------------------------------------- */
export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                { error: "Missing id" },
                { status: 400 }
            );
        }

        // Find the adjustment to rollback
        const adj = await Adjustment.findById(id);
        if (!adj) {
            return NextResponse.json(
                { error: "Adjustment not found" },
                { status: 404 }
            );
        }

        // 1️⃣ Delete adjustment
        await Adjustment.findByIdAndDelete(id);

        // 2️⃣ Optional rollback of stock
        const inv = await InventoryItem.findOne({ itemName: adj.itemName });
        if (inv) {
            // Reverse qty (if adjustment was -5, rollback adds +5)
            inv.unitsAvailable = Math.max(0, inv.unitsAvailable - Number(adj.qty));
            inv.updatedAt = new Date();
            await inv.save();
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("🔥 Adjustment DELETE Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
