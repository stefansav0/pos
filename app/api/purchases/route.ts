import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Purchase from "@/models/Purchase";

export const dynamic = "force-dynamic";

/* ---------------------------------------------
   GET — Fetch all purchases
--------------------------------------------- */
export async function GET() {
    await dbConnect();
    const purchases = await Purchase.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(purchases);
}

/* ---------------------------------------------
   POST — Create a new purchase
--------------------------------------------- */
export async function POST(req: NextRequest) {
    await dbConnect();
    const body = await req.json();

    // Convert createdAt to a Date object if needed
    if (body.createdAt && typeof body.createdAt === "string") {
        body.createdAt = new Date(body.createdAt);
    }

    const created = await Purchase.create(body);
    return NextResponse.json(created, { status: 201 });
}

/* ---------------------------------------------
   DELETE — Delete purchase by ID
--------------------------------------------- */
export async function DELETE(req: NextRequest) {
    await dbConnect();

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await Purchase.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
}

/* ---------------------------------------------
   PUT — Update purchase by ID (optional)
--------------------------------------------- */
export async function PUT(req: NextRequest) {
    await dbConnect();
    const body = await req.json();

    const id = body._id;
    if (!id) {
        return NextResponse.json(
            { error: "Missing '_id' in request body" },
            { status: 400 }
        );
    }

    if (body.createdAt && typeof body.createdAt === "string") {
        body.createdAt = new Date(body.createdAt);
    }

    const updated = await Purchase.findByIdAndUpdate(id, body, {
        new: true,
    });

    return NextResponse.json(updated);
}
