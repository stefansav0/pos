import { Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema(
    {
        category: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        notes: { type: String },
    },
    { timestamps: true }
);

const Expense = models.Expense || model("Expense", ExpenseSchema);
export default Expense;
