import mongoose from "mongoose";

const recipeImageSchema=new mongoose.Schema(
    {
        recipeId: { type: mongoose.Schema.Types.ObjectId, ref:'recipes', required: true },
        recipeImage: {type:String, required:true},
    },
    {
        collection:"recipeImage"
    }
)
mongoose.model("recipeImage", recipeImageSchema);  