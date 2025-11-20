import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sale from "@/models/Sale";

export const dynamic = "force-dynamic";

/* ---------------------------------------------------
   GET — Fetch all sales
--------------------------------------------------- */
export async function GET() {
    await dbConnect();
    const sales = await Sale.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(sales);
}

/* ---------------------------------------------------
   POST — Create a new sale
--------------------------------------------------- */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        /* -------- Required field validation -------- */
        const required = [
            "itemName",
            "qtySold",
            "sellingPricePerUnit",
            "deliveryCost",
            "packagingCost",
            "cogsTotal",
            "revenueTotal",
            "profitTotal",
            "unitCostBeforeExtras",
        ];

        for (const field of required) {
            if (body[field] === undefined) {
                return NextResponse.json(
                    { error: `Missing field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Ensure createdAt is a Date object
        if (body.createdAt && typeof body.createdAt === "string") {
            body.createdAt = new Date(body.createdAt);
        }

        const created = await Sale.create(body);
        return NextResponse.json(created, { status: 201 });

    } catch (err: any) {
        console.error("🔥 Sales API Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* ---------------------------------------------------
   DELETE — Delete sale by ID
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

        await Sale.findByIdAndDelete(id);

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("🔥 Sales DELETE Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* ---------------------------------------------------
   PUT — Update existing sale (optional)
--------------------------------------------------- */
export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const id = body._id;
        if (!id) {
            return NextResponse.json(
                { error: "Missing _id in request body" },
                { status: 400 }
            );
        }

        if (body.createdAt && typeof body.createdAt === "string") {
            body.createdAt = new Date(body.createdAt);
        }

        const updated = await Sale.findByIdAndUpdate(id, body, {
            new: true,
        });

        return NextResponse.json(updated);

    } catch (err: any) {
        console.error("🔥 Sales PUT Error:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
