import mongoose from "mongoose";

const WastageSchema = new mongoose.Schema(
    {
        itemName: { type: String, required: true },
        qty: { type: Number, required: true },
        reason: { type: String, required: true },
        costLoss: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export default mongoose.models.Wastage ||
    mongoose.model("Wastage", WastageSchema);
