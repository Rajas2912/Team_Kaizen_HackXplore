import mongoose from "mongoose";
const vivaSchema =mongoose.Schema({
    classid:{
        type:String,
    },
    vivaname:{
        type:String,
        required:[true,"provide name"]
    },
    timeofthinking:{
        type:Number,
        required:[true,"provide time"]
    },
    duedate:{
        type:Date,
        required:[true,"provide date"]
    },
    status: {
        type: Boolean,
        default: true, 
    },
    questionAnswerSet:[
    {
        questionText: { type: String, required: true },
        answer: { type: String, required: true }
    }
    ]
},{ timestamps: true });

const Viva = mongoose.model("Viva",vivaSchema);
export default Viva;