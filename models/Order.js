import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        billNumber: { type: String, required: true },
        customerName: { type: String },
        totalAmount: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ["CASH", "UPI", "CARD"],
            required: true,
        },

        items: [
            {
                itemName: { type: String, required: true },
                quantity: { type: Number, required: true },
                costPerUnit: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],

        notes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
