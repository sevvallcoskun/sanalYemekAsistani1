import mongoose from "mongoose";
 
const dailyPlanSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'recipes' }]
});

const weeklyPlanSchema = new mongoose.Schema({   
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    dailyPlans: [dailyPlanSchema]
}, { collection: "weeklyPlans" });

mongoose.model("weeklyPlan", weeklyPlanSchema); 