import mongoose from "mongoose";

const allergiesSchema=new mongoose.Schema(
    {
        allergenName:{type:String, required:true},
    },
    {
        collection:"allergies"
    }
)
mongoose.model("allergies",allergiesSchema); 