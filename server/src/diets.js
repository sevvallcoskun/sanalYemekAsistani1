import mongoose from "mongoose";

const dietsSchema=new mongoose.Schema(
    {
        dietType:{type:String, required:true},
    }, 
    {
        collection:"diets"
    }
)
mongoose.model("diets",dietsSchema); 