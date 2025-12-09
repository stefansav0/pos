import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(_, { params }) {
    await dbConnect();
    const order = await Order.findById(params.id);
    return Response.json(order);
}

export async function DELETE(_, { params }) {
    await connectDB();
    await Order.findByIdAndDelete(params.id);
    return Response.json({ message: "Order deleted" });
}
