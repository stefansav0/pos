import { Schema, model, models } from "mongoose";

const InventoryItemSchema = new Schema(
    {
        itemName: { type: String, required: true, unique: true },
        unitsAvailable: { type: Number, required: true },
        avgCostPerUnit: { type: Number, required: true },
    },
    { timestamps: true }
);

const InventoryItem =
    models.InventoryItem || model("InventoryItem", InventoryItemSchema);
export default InventoryItem;
