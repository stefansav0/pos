import { Schema, model, models } from "mongoose";

const PurchaseSchema = new Schema(
    {
        itemName: { type: String, required: true },
        unitType: { type: String },
        totalUnitsProduced: { type: Number, required: true },
        costPerUnit: { type: Number, required: true },
        purchaseCost: { type: Number },
        packagingCost: { type: Number },
        travelCost: { type: Number },
    },
    { timestamps: true }
);

const Purchase = models.Purchase || model("Purchase", PurchaseSchema);
export default Purchase;
