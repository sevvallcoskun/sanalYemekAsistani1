import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipes', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 }
    },
    { 
        collection: "rating",
        timestamps: true // This adds createdAt and updatedAt fields
    }
);

const Rating = mongoose.model("rating", ratingSchema);

export default Rating;
