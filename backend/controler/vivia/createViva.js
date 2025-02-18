import Viva from "../../model/viva.model.js";
export const  createViva=async(req,res)=>{
    console.log(req.body);
    try {
        const {classid,vivaname,timeofthinking,numberOfQuestionsToAsk,duedate,questionAnswerSet}=req.body;
        const newViva=await new Viva({
            classid,
            vivaname,
            numberOfQuestionsToAsk,
            timeofthinking,
            duedate,
            questionAnswerSet
        });
        await newViva.save();
        return res.status(201).json({
            message:"Viva created successfully",
            data:newViva,
            succes:true
        });
    } catch (error) {
        console.log("Error:",error);
        return res.status(500).json({ message: error.message || error });
    }
}