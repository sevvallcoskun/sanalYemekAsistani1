import mongoose from "mongoose";

const unitSchema=new mongoose.Schema(
    {
        name:{type:String, required:true},
    },
    { 
        collection:"unit"
    }
)
mongoose.model("unit",unitSchema);