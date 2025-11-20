import { Schema, model, models } from "mongoose";

const AdjustmentSchema = new Schema(
    {
        itemName: { type: String, required: true },
        qty: { type: Number, required: true }, // negative = damage/loss
        reason: { type: String },
    },
    { timestamps: true }
);

const Adjustment =
    models.Adjustment || model("Adjustment", AdjustmentSchema);
export default Adjustment;
