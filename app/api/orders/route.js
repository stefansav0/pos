import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { updateInventoryOnSale } from "@/utils/updateInventoryOnSale";

export async function GET() {
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return Response.json(orders);

}

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();

        const order = await Order.create(body);

        // Deduct inventory
        await updateInventoryOnSale(body.items);

        return Response.json(order, { status: 201 });
    } catch (err) {
        console.error(err);
        return Response.json({ message: "Server Error" }, { status: 500 });
    }
}
