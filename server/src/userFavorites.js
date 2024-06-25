 import mongoose from "mongoose";

 const favoriRecipesSchema=  new mongoose.Schema({
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'recipes' }]
});

 const userFavoritesSchema= new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    favoriRecipes: [favoriRecipesSchema]
 },
 { 
     collection:"userFavorites"
 }
);
mongoose.model("userFavorites", userFavoritesSchema);
