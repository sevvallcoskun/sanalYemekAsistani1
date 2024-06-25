import mongoose from "mongoose";

const instructionSchema=new mongoose.Schema(
    {
        recipeId: { type: mongoose.Schema.Types.ObjectId, ref:'recipes', required: true },
        description:{type:String, required:true}
    },
    { 
        collection:"instruction"
    }
)
const Instruction = mongoose.model("instruction", instructionSchema);

export default Instruction;
