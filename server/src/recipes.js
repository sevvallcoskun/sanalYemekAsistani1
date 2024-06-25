import mongoose from "mongoose"; 
 
const recipesSchema=new mongoose.Schema(
    {  
        recipeName:{type:String, required:true},
        recipeImage: {type:String, required:true},
        servicesCount:{type:Number, required:true},
        cookingTime:{type:Number, required:true},
        preparationTime:{type:Number, required:true},
        isAddedToPlan: { type: Boolean, default: false },
        isShared: { type: Boolean, default: true },
        categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],
        userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    },
    { 
        collection:"recipes"
    }
)
mongoose.model("recipes",recipesSchema);

