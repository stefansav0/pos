import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sale from "@/models/Sale";

export const dynamic = "force-dynamic";

export async function GET() {
    await dbConnect();

    // Daily (last 7 days)
    const last7 = await Sale.aggregate([
        {
            $match: {
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$revenueTotal" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Weekly (last 8 weeks)
    const last8weeks = await Sale.aggregate([
        {
            $group: {
                _id: { $isoWeek: "$createdAt" },
                revenue: { $sum: "$revenueTotal" }
            }
        },
        { $sort: { _id: 1 } },
        { $limit: 8 }
    ]);

    // Monthly (last 6 months)
    const months = await Sale.aggregate([
        {
            $group: {
                _id: { $month: "$createdAt" },
                revenue: { $sum: "$revenueTotal" }
            }
        },
        { $sort: { _id: 1 } },
        { $limit: 6 }
    ]);

    return NextResponse.json({ daily: last7, weekly: last8weeks, monthly: months });
}
