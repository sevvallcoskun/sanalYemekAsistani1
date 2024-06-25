import mongoose from "mongoose";

const recipeIngredientsSchema=new mongoose.Schema(
    {
        recipeId: { type: mongoose.Schema.Types.ObjectId, ref:'recipes', required: true },
        ingredientId: { type: mongoose.Schema.Types.ObjectId, ref:'ingredient', required: true },
        unitId: { type: mongoose.Schema.Types.ObjectId, ref:'unit', required: true },
        amount:{type: Number, required: true},  
    },
    {
        collection:"recipeIngredients"
    }
)
mongoose.model("recipeIngredients", recipeIngredientsSchema);  