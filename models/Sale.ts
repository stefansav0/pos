import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
    {
        itemName: { type: String, required: true },

        qtySold: { type: Number, required: true },

        sellingPricePerUnit: { type: Number, required: true },

        deliveryCost: { type: Number, required: true },
        packagingCost: { type: Number, required: true },

        // core calculations
        cogsTotal: { type: Number, required: true },
        revenueTotal: { type: Number, required: true },
        profitTotal: { type: Number, required: true },

        // inventory reference (at sale time)
        unitCostBeforeExtras: { type: Number, required: true },

        notes: { type: String, default: null },
    },
    { timestamps: true } // auto-createdAt, updatedAt
);

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
