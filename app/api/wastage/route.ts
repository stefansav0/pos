import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wastage from "@/models/Wastage";
import InventoryItem from "@/models/InventoryItem";

export const dynamic = "force-dynamic";

export async function GET() {
    await dbConnect();
    const rows = await Wastage.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const body = await req.json();

    const { itemName, qty, reason } = body;

    if (!itemName || !qty || !reason)
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // get inventory item
    const inv = await InventoryItem.findOne({ itemName });
    if (!inv)
        return NextResponse.json({ error: "Item not found" }, { status: 404 });

    if (inv.unitsAvailable < qty)
        return NextResponse.json(
            { error: "Not enough stock to waste" },
            { status: 400 }
        );

    // calculate cost loss
    const costLoss = qty * inv.avgCostPerUnit;

    // create wastage entry
    const saved = await Wastage.create({
        itemName,
        qty,
        reason,
        costLoss
    });

    // update inventory (deduct wasted)
    await InventoryItem.updateOne(
        { itemName },
        {
            unitsAvailable: inv.unitsAvailable - qty,
            updatedAt: new Date()
        }
    );

    return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
    await dbConnect();

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const row = await Wastage.findById(id);
    if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    // rollback inventory
    await InventoryItem.updateOne(
        { itemName: row.itemName },
        { $inc: { unitsAvailable: row.qty } }
    );

    await Wastage.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
}
