import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";

export const dynamic = "force-dynamic";

/* ---------------------------------------------
   GET — Fetch all expenses
--------------------------------------------- */
export async function GET() {
    await dbConnect();
    const rows = await Expense.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(rows);
}

/* ---------------------------------------------
   POST — Create new expense
--------------------------------------------- */
export async function POST(req: NextRequest) {
    await dbConnect();
    const body = await req.json();

    // ensure date is Date type
    if (body.date && typeof body.date === "string") {
        body.date = new Date(body.date);
    }

    const created = await Expense.create(body);
    return NextResponse.json(created, { status: 201 });
}

/* ---------------------------------------------
   DELETE — Delete expense by ID
--------------------------------------------- */
export async function DELETE(req: NextRequest) {
    await dbConnect();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing 'id' parameter" },
            { status: 400 }
        );
    }

    await Expense.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}

/* ---------------------------------------------
   PUT — Update an expense (optional)
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

    // Ensure date type
    if (body.date && typeof body.date === "string") {
        body.date = new Date(body.date);
    }

    const updated = await Expense.findByIdAndUpdate(id, body, {
        new: true,
    });

    return NextResponse.json(updated);
}
