import mongoose from "mongoose";
 
const shoppingListSchema=new mongoose.Schema(
    { 
        itemName:{type: String, required:true},
        amount:{type: Number},
        unit:{type: String},
        recipeId:{type: mongoose.Schema.Types.ObjectId, ref: 'recipes'},
        userId:{type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
    },
    {
        collection:"shoppingList"
    }
)
mongoose.model("shoppingList", shoppingListSchema); 

