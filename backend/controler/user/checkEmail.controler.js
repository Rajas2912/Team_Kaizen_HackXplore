// if login then verify user exist or ot 
import User from "../../model/user.model.js";
export const checkEmail=async(req,res)=>{
 try {
    const {email}=req.body;
    const checkEmail =await User.findOne({email});
    if(!checkEmail)
    {
        return res.status(400).json({
            message:"User not exist register first!",
            error:true
        })
    }
    return res.status(200).json({
        message:"Email verify ",
        success:true,
        data:checkEmail
    }); 

 } catch (error) {
     return res.status(500).json({
        message:error.message ||error,
        error :true
     })
 }
}