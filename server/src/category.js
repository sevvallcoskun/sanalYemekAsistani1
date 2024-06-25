import mongoose from "mongoose";
 
const categorySchema=new mongoose.Schema(
    {
        name:{type:String, required:true},
        categoryImage: {type:String, required:true},
    },
    {
        collection:"category"
    }
)
mongoose.model("category", categorySchema); 

